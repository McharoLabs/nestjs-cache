export type CacheStore = 'memory' | 'redis';

export interface CacheRedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface CacheMemoryConfig {
  ttl: number;
}

export interface CacheConfig {
  defaultStore: CacheStore;
  redis: CacheRedisConfig;
  memory: CacheMemoryConfig;
  appName?: string;
}
