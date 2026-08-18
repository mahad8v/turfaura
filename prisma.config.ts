import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js conventionally keeps secrets in .env.local; the Prisma CLI (outside
// Next's own env loader) needs to be told to read it explicitly.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // The installed Prisma version's config schema only takes one `url` (no
  // `directUrl`), so CLI commands (migrate, etc.) deliberately use the direct
  // connection here. The app itself uses DATABASE_URL (pooled) at runtime via
  // the driver adapter in lib/prisma.ts.
  //
  // shadowDatabaseUrl is only used by `prisma migrate dev`'s diff engine —
  // never set in production, and `env()` throws on a missing var, so this
  // reads it directly rather than requiring it everywhere `prisma generate`
  // runs (e.g. in `npm run build` on a deploy host with no shadow database).
  datasource: {
    url: env("DIRECT_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
