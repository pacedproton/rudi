/**
 * Database Module - Exports and factory for database access
 */

export * from './types';
export * from './Repository';
export { YamlDatabase, getDatabase, resetDatabase } from './YamlAdapter';
export { PostgresDatabase } from './PostgresAdapter';

import type { Database } from './Repository';
import { YamlDatabase } from './YamlAdapter';
import { PostgresDatabase } from './PostgresAdapter';

/**
 * Create a database instance based on configuration
 */
export function createDatabase(config: {
  type: 'yaml' | 'postgres';
  dataDir?: string;
  connectionString?: string;
}): Database {
  switch (config.type) {
    case 'yaml':
      return new YamlDatabase(config.dataDir || './data');
    case 'postgres':
      if (!config.connectionString) {
        throw new Error('PostgreSQL requires a connection string');
      }
      return new PostgresDatabase(config.connectionString);
    default:
      throw new Error(`Unknown database type: ${config.type}`);
  }
}
