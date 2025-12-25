# SvelteKit Language Study App

A web application to manage translations and Japanese language study materials.

## Tech Stack

- **Framework**: SvelteKit 2
- **Package Manager**: Bun
- **Styling**: TailwindCSS 4
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Markdown**: marked

## Features

- User authentication (register/login/logout)
- CRUD operations for translations
- Advanced search with query syntax
- Markdown support for all text fields
- Expandable text input fields

## Search Syntax

The search supports a powerful query language:

| Syntax | Description |
|--------|-------------|
| `AA BB` | Find AA OR BB in any field |
| `o:term` | Search original text |
| `r:term` | Search reading |
| `t:term` | Search translation |
| `n:term` | Search notes |
| `c:term` | Search created date |
| `&` | AND operator |
| `\|` | OR operator |
| `!` | NOT operator |
| `()` | Grouping |

Examples:
- `o:hello|world` - original contains "hello" OR "world"
- `t:AA&BB` - translation contains both "AA" AND "BB"
- `t:!error` - translation does NOT contain "error"
- `o:(!AA&BB)|CC` - complex grouping

## Database Schema

### Table: `users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Unique, required |
| password_hash | text | Hashed password |
| created_at | timestamp | Account creation date |

### Table: `translations`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| original_lang | text | Source language code (ja, en, it, de, ...) |
| original_text | text | Original text (markdown) |
| original_reading | text | Reading/pronunciation (markdown) |
| translation_lang | text | Target language code |
| translation_text | text | Translated text (markdown) |
| notes | text | Additional notes (markdown) |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update date |

## Getting Started

```bash
# Install dependencies
bun install

# Create database
psql -U ab -d postgres -c "CREATE DATABASE lang;"

# Push schema to database
bun run db:push

# Start development server
bun run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check` | Type check |
| `bun run db:generate` | Generate migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Open Drizzle Studio |

## Environment Variables

Create a `.env` file:
```
DATABASE_URL=postgres://ab@localhost/lang
```

Note: Uses Unix socket connection via `/tmp`.
