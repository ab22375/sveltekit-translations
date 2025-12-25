import { and, or, not, ilike, type SQL } from 'drizzle-orm';
import { translations } from './db/schema';

type FieldKey = 'o' | 'r' | 't' | 'n' | 'c' | 'all';

const fieldMap = {
	o: translations.originalText,
	r: translations.originalReading,
	t: translations.translationText,
	n: translations.notes,
	c: translations.createdAt
} as const;

interface Token {
	type: 'TERM' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN' | 'FIELD' | 'EOF';
	value: string;
}

class Lexer {
	private pos = 0;
	private input: string;

	constructor(input: string) {
		this.input = input;
	}

	private peek(): string {
		return this.input[this.pos] || '';
	}

	private advance(): string {
		return this.input[this.pos++] || '';
	}

	private skipWhitespace(): void {
		while (/\s/.test(this.peek())) this.advance();
	}

	tokenize(): Token[] {
		const tokens: Token[] = [];

		while (this.pos < this.input.length) {
			this.skipWhitespace();
			if (this.pos >= this.input.length) break;

			const char = this.peek();

			if (char === '(') {
				tokens.push({ type: 'LPAREN', value: '(' });
				this.advance();
			} else if (char === ')') {
				tokens.push({ type: 'RPAREN', value: ')' });
				this.advance();
			} else if (char === '&') {
				tokens.push({ type: 'AND', value: '&' });
				this.advance();
			} else if (char === '|') {
				tokens.push({ type: 'OR', value: '|' });
				this.advance();
			} else if (char === '!') {
				tokens.push({ type: 'NOT', value: '!' });
				this.advance();
			} else {
				// Read a term (word or quoted string)
				let term = '';

				if (char === '"' || char === "'") {
					const quote = this.advance();
					while (this.peek() && this.peek() !== quote) {
						term += this.advance();
					}
					this.advance(); // consume closing quote
				} else {
					while (this.peek() && !/[\s()&|!]/.test(this.peek())) {
						term += this.advance();
					}
				}

				if (term) {
					tokens.push({ type: 'TERM', value: term });
				}
			}
		}

		tokens.push({ type: 'EOF', value: '' });
		return tokens;
	}
}

interface ASTNode {
	type: 'term' | 'and' | 'or' | 'not';
	value?: string;
	left?: ASTNode;
	right?: ASTNode;
	child?: ASTNode;
}

class Parser {
	private tokens: Token[];
	private pos = 0;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	private peek(): Token {
		return this.tokens[this.pos] || { type: 'EOF', value: '' };
	}

	private advance(): Token {
		return this.tokens[this.pos++] || { type: 'EOF', value: '' };
	}

	private expect(type: Token['type']): Token {
		const token = this.advance();
		if (token.type !== type) {
			throw new Error(`Expected ${type}, got ${token.type}`);
		}
		return token;
	}

	parse(): ASTNode | null {
		if (this.peek().type === 'EOF') return null;
		return this.parseOr();
	}

	private parseOr(): ASTNode {
		let left = this.parseAnd();

		while (this.peek().type === 'OR') {
			this.advance();
			const right = this.parseAnd();
			left = { type: 'or', left, right };
		}

		return left;
	}

	private parseAnd(): ASTNode {
		let left = this.parseUnary();

		while (this.peek().type === 'AND') {
			this.advance();
			const right = this.parseUnary();
			left = { type: 'and', left, right };
		}

		return left;
	}

	private parseUnary(): ASTNode {
		if (this.peek().type === 'NOT') {
			this.advance();
			const child = this.parseUnary();
			return { type: 'not', child };
		}
		return this.parsePrimary();
	}

	private parsePrimary(): ASTNode {
		const token = this.peek();

		if (token.type === 'LPAREN') {
			this.advance();
			const node = this.parseOr();
			this.expect('RPAREN');
			return node;
		}

		if (token.type === 'TERM') {
			this.advance();
			return { type: 'term', value: token.value };
		}

		throw new Error(`Unexpected token: ${token.type}`);
	}
}

function astToSQL(ast: ASTNode, field: typeof fieldMap[keyof typeof fieldMap]): SQL {
	switch (ast.type) {
		case 'term':
			return ilike(field, `%${ast.value}%`);
		case 'and':
			return and(astToSQL(ast.left!, field), astToSQL(ast.right!, field))!;
		case 'or':
			return or(astToSQL(ast.left!, field), astToSQL(ast.right!, field))!;
		case 'not':
			return not(astToSQL(ast.child!, field));
		default:
			throw new Error(`Unknown AST node type`);
	}
}

function astToSQLAllFields(ast: ASTNode): SQL {
	const fields = [
		translations.originalText,
		translations.originalReading,
		translations.translationText,
		translations.notes
	];

	switch (ast.type) {
		case 'term':
			return or(...fields.map((f) => ilike(f, `%${ast.value}%`)))!;
		case 'and':
			return and(astToSQLAllFields(ast.left!), astToSQLAllFields(ast.right!))!;
		case 'or':
			return or(astToSQLAllFields(ast.left!), astToSQLAllFields(ast.right!))!;
		case 'not':
			return not(astToSQLAllFields(ast.child!));
		default:
			throw new Error(`Unknown AST node type`);
	}
}

interface SearchPart {
	field: FieldKey;
	query: string;
}

function parseSearchParts(search: string): SearchPart[] {
	const parts: SearchPart[] = [];
	const regex = /([ortncORTNC]):(\S+)|(\S+)/g;
	let match;

	while ((match = regex.exec(search)) !== null) {
		if (match[1] && match[2]) {
			// Field-specific search
			parts.push({
				field: match[1].toLowerCase() as FieldKey,
				query: match[2]
			});
		} else if (match[3]) {
			// General search term
			parts.push({
				field: 'all',
				query: match[3]
			});
		}
	}

	return parts;
}

export function buildSearchQuery(search: string): SQL | null {
	if (!search.trim()) return null;

	const parts = parseSearchParts(search);
	if (parts.length === 0) return null;

	const conditions: SQL[] = [];

	for (const part of parts) {
		try {
			const lexer = new Lexer(part.query);
			const tokens = lexer.tokenize();
			const parser = new Parser(tokens);
			const ast = parser.parse();

			if (!ast) continue;

			if (part.field === 'all') {
				conditions.push(astToSQLAllFields(ast));
			} else if (part.field === 'c') {
				// Date field - for now just do a string match on the ISO date
				// Could be enhanced to support date ranges
				conditions.push(ilike(translations.createdAt as any, `%${part.query}%`));
			} else {
				const field = fieldMap[part.field];
				conditions.push(astToSQL(ast, field));
			}
		} catch (e) {
			// If parsing fails, fall back to simple ILIKE
			if (part.field === 'all') {
				conditions.push(
					or(
						ilike(translations.originalText, `%${part.query}%`),
						ilike(translations.originalReading, `%${part.query}%`),
						ilike(translations.translationText, `%${part.query}%`),
						ilike(translations.notes, `%${part.query}%`)
					)!
				);
			} else if (part.field !== 'c') {
				const field = fieldMap[part.field];
				conditions.push(ilike(field, `%${part.query}%`));
			}
		}
	}

	if (conditions.length === 0) return null;
	if (conditions.length === 1) return conditions[0];

	// Default behavior: OR all parts together for general search
	return or(...conditions)!;
}
