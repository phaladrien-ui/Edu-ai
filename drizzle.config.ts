// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.example' })

export default defineConfig({
  schema: './server/db/schema.ts',  // ← Change ici : "db" au lieu de "database"
  out: './server/db/migrations',    // ← Change ici aussi
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})