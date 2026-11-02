import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required (Supabase transaction pooler on port 6543)'),
  DIRECT_URL: z
    .string()
    .min(1, 'DIRECT_URL is required (Supabase session pooler on port 5432)'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOW_SEED: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

export function validateEnv(): ValidatedEnv {
  // In test environments, mock or bypass strict validation
  if (process.env.NODE_ENV === 'test') {
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock',
      DIRECT_URL: process.env.DIRECT_URL || 'postgresql://mock:mock@localhost:5432/mock',
      NODE_ENV: 'test',
    };
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `   - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    const errorMessage = `\n[FATAL] Startup Environment Validation Failed:\n${errorDetails}\n\nPlease check your .env.local file against .env.example.\n`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return parsed.data;
}

// Eagerly validate environment variables on module evaluation
export const env = validateEnv();
