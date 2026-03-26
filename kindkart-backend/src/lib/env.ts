import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // JWT
  JWT_SECRET: string;
  
  // Server
  PORT: number;
  FRONTEND_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Redis (optional)
  REDIS_URL?: string;
  
  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  S3_BUCKET_NAME?: string;
  AWS_REGION?: string;
  
  // Razorpay (optional)
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  
  // Firebase (optional)
  FIREBASE_SERVICE_ACCOUNT?: string;
  
  // Gemini AI (optional)
  GEMINI_API_KEY?: string;
}

// In development, only DATABASE_URL is truly required
// JWT_SECRET can have a default in development
const getRequiredEnvVars = (): readonly string[] => {
  if (process.env.NODE_ENV === 'production') {
    return ['JWT_SECRET'] as const;
  }
  return [] as const;
};

const optionalEnvVars = [
  'REDIS_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
  'AWS_REGION',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'FIREBASE_SERVICE_ACCOUNT',
] as const;

function validateEnv(): EnvConfig {
  const missing: string[] = [];
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const requiredEnvVars = getRequiredEnvVars();
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }
  
  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET!;
    if (jwtSecret.length < 32) {
      console.warn(
        '⚠️  WARNING: JWT_SECRET is too short for production. ' +
        'Please use at least 32 characters for security.'
      );
    }
  }
  
  // SQLite doesn't need DATABASE_URL validation - it's file-based
  // DATABASE_URL is optional now, but kept for compatibility
  const dbUrl = process.env.DATABASE_URL || 'file:../data/kindkart.db';
  
  return {
    DATABASE_URL: dbUrl,
    JWT_SECRET: process.env.JWT_SECRET || (isDevelopment ? 'dev-secret-key-change-in-production-' + Date.now() : ''),
    PORT: parseInt(process.env.PORT || '3001', 10),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    REDIS_URL: process.env.REDIS_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
  };
}

// Validate on import
let env: EnvConfig;
try {
  env = validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing in development mode with defaults...');
    // Provide defaults for development
    const defaultJWTSecret = 'dev-secret-key-change-in-production-' + Math.random().toString(36).substring(7);
    env = {
      DATABASE_URL: process.env.DATABASE_URL || 'file:../data/kindkart.db',
      JWT_SECRET: process.env.JWT_SECRET || defaultJWTSecret,
      PORT: parseInt(process.env.PORT || '3001', 10),
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      NODE_ENV: 'development',
    } as EnvConfig;
    console.log('✅ Using development defaults. Set JWT_SECRET in .env for production.');
  }
}

export { env, validateEnv };
export type { EnvConfig };

