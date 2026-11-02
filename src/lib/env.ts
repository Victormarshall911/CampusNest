import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required'),
    DIRECT_URL: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional(),
    SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY cannot be empty').optional(),
    SEED_ALLOWED_PROJECT_REF: z.string().optional(),
    ALLOW_SEED: z.string().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      try {
        const url = new URL(data.DATABASE_URL);
        const isPort6543 = url.port === '6543' || data.DATABASE_URL.includes(':6543');
        const hasPgBouncer =
          url.searchParams.get('pgbouncer') === 'true' || data.DATABASE_URL.includes('pgbouncer=true');

        if (!isPort6543) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['DATABASE_URL'],
            message: 'In production, DATABASE_URL must connect through the Supabase transaction pooler on port 6543',
          });
        }

        if (!hasPgBouncer) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['DATABASE_URL'],
            message: 'In production, DATABASE_URL must include ?pgbouncer=true parameter',
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL must be a valid connection string',
        });
      }
    }
  });

export type ValidatedEnv = z.infer<typeof envSchema>;

export function validateEnv(): ValidatedEnv {
  // Tolerate missing DB during tests or when SKIP_ENV_VALIDATION=true in development.
  // Never skip validation in production.
  if (
    process.env.NODE_ENV === 'test' ||
    (process.env.NODE_ENV !== 'production' && process.env.SKIP_ENV_VALIDATION === 'true')
  ) {
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock',
      DIRECT_URL: process.env.DIRECT_URL,
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    };
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `   - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // Never log raw connection strings or secrets
    const errorMessage = `\n[FATAL] Startup Environment Validation Failed:\n${errorDetails}\n\nPlease check your .env.local file against .env.example (connection strings/passwords are redacted).\n`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return parsed.data;
}

export const env = validateEnv();
