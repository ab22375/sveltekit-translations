# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

This is a SvelteKit web application for managing translations and Japanese language study materials.

## Tech Stack

- SvelteKit 2 with TypeScript
- Svelte 5 runes syntax ($state, $derived, $effect, $props)
- TailwindCSS 4 (import syntax, not config-based)
- Drizzle ORM with PostgreSQL
- Bun as package manager and runtime

## Key Patterns

### Svelte 5 Runes
Use Svelte 5 runes syntax:
```svelte
let { data }: { data: PageData } = $props();
let count = $state(0);
const doubled = $derived(count * 2);
```

### Database Connection
The database uses Unix socket connection at `/tmp`:
```typescript
const client = postgres({
  host: '/tmp',
  database: 'translations',
  username: 'ab'
});
```

### Authentication
Session-based auth with cookies. Check `locals.user` in server load functions:
```typescript
if (!locals.user) {
  redirect(302, '/auth/login');
}
```

### Form Validation
Use Zod for validation. Access errors via `.issues[0].message` (Zod v4):
```typescript
const result = schema.safeParse(data);
if (!result.success) {
  return fail(400, { error: result.error.issues[0].message });
}
```

## File Structure

- `src/lib/server/db/` - Database schema and connection
- `src/lib/server/auth.ts` - Authentication functions
- `src/lib/server/search.ts` - Search query parser
- `src/routes/auth/` - Login, register, logout
- `src/routes/translations/` - CRUD for translations

## Commands

```bash
bun run dev          # Start dev server
bun run check        # Type check
bun run db:push      # Sync schema to database
```

## Database

PostgreSQL database named `translations`. Access via:
```bash
psql -U ab -d translations
```
