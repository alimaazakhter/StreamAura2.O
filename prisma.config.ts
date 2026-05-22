import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Fallback to a mock PostgreSQL connection string if env variables are empty
// (e.g. during build-time static pre-rendering in Next.js Turbopack)
// to prevent PrismaClient initialization crashes.
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
});
