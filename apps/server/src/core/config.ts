import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface DatabaseConfig {
  path: string;
  verbose: boolean;
  readonly: boolean;
  fileMustExist: boolean;
  timeout: number;
  backup: {
    enabled: boolean;
    path: string;
    interval: number; // in hours
  };
}

export interface AppConfig {
  env: string;
  port: number;
  host: string;
  database: DatabaseConfig;
  api: {
    prefix: string;
    version: string;
  };
  security: {
    jwtSecret: string;
    sessionSecret: string;
    bcryptRounds: number;
  };
}

export function loadConfig(): AppConfig {
  const dataDir = path.join(process.cwd(), 'data');
  const backupDir = path.join(dataDir, 'backups');

  // Ensure directories exist
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    database: {
      path: process.env.DATABASE_PATH || path.join(dataDir, 'vaybooks.db'),
      verbose: process.env.NODE_ENV === 'development',
      readonly: false,
      fileMustExist: false,
      timeout: 5000,
      backup: {
        enabled: process.env.DATABASE_BACKUP_ENABLED !== 'false',
        path: process.env.DATABASE_BACKUP_PATH || backupDir,
        interval: parseInt(process.env.DATABASE_BACKUP_INTERVAL || '24', 10),
      },
    },
    api: {
      prefix: process.env.API_PREFIX || '/api',
      version: process.env.API_VERSION || 'v1',
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
      sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    },
  };
}

export const config = loadConfig();
