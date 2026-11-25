import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5050').transform((val) => parseInt(val, 10)),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432').transform((val) => parseInt(val, 10)),
  DB_NAME: z.string().default('nomads_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('root'),
  DB_LOGGING: z.string().default('false').transform((val) => val === 'true'),
  JWT_SECRET: z.string().default('nomads_super_secret_jwt_key_2026_design_academy'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@2nomads.design'),
  DEFAULT_ADMIN_PASSWORD: z.string().default('AdminPassword123!'),
  DEFAULT_ADMIN_NAME: z.string().default('R Donshong Koren (Admin)'),

  // Email / SMTP Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('2NOMADS Studio & Academy <admissions@2nomads.design>'),
  SMTP_MOCK_MODE: z.string().default('true').transform((val) => val === 'true'),
  ADMIN_NOTIFICATION_EMAIL: z.string().default('admin@2nomads.design'),

  // WhatsApp Meta Cloud API Configuration
  WHATSAPP_PHONE_NUMBER_ID: z.string().default(''),
  WHATSAPP_ACCESS_TOKEN: z.string().default(''),
  WHATSAPP_API_VERSION: z.string().default('v21.0'),
  WHATSAPP_MOCK_MODE: z.string().default('true').transform((val) => val === 'true'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
