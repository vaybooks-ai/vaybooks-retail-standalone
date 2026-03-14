import Database from 'better-sqlite3';
import { config } from './config';
import path from 'path';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database.Database;

  private constructor() {
    console.log(`Connecting to database at: ${config.database.path}`);
    
    this.db = new Database(config.database.path, {
      verbose: config.database.verbose ? console.log : undefined,
      readonly: config.database.readonly,
      fileMustExist: config.database.fileMustExist,
      timeout: config.database.timeout,
    });

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Optimize for performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = MEMORY');
    
    // Register cleanup
    process.on('exit', () => this.close());
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());

    console.log('Database connected successfully');
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public close(): void {
    if (this.db) {
      console.log('Closing database connection...');
      this.db.close();
      console.log('Database connection closed');
    }
  }

  public backup(backupPath?: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = backupPath || path.join(
      config.database.backup.path,
      `backup-${timestamp}.db`
    );

    try {
      // Use SQLite's backup API
      this.db.backup(backupFile);
      console.log(`Database backed up to: ${backupFile}`);
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  public transaction<T>(fn: () => T): T {
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  public prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public run(sql: string, ...params: any[]): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  public get(sql: string, ...params: any[]): any {
    return this.db.prepare(sql).get(...params);
  }

  public all(sql: string, ...params: any[]): any[] {
    return this.db.prepare(sql).all(...params);
  }
}

// Export singleton instance getter
export function getDatabase(): Database.Database {
  return DatabaseConnection.getInstance().getDb();
}

// Export connection instance for advanced usage
export function getDatabaseConnection(): DatabaseConnection {
  return DatabaseConnection.getInstance();
}
