import { createKeyv, Keyv } from '@keyv/redis';
import { KeyvCacheableMemory } from 'cacheable';
import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import type { CacheConfig, CacheStore } from '../types/cache.types';

export type StoreFactory = () => Keyv[];

export interface BuiltCacheConfig {
  defaultStore: CacheStore;
  stores: Record<CacheStore, StoreFactory>;
}

export function createCacheConfig(config: CacheConfig): BuiltCacheConfig {
  const memoryConfig = config.memory;
  const redisConfig = config.redis;

  return {
    defaultStore: config.defaultStore,
    stores: {
      memory: (): Keyv[] => {
        if (!memoryConfig) {
          throw new Error(
            'Memory cache configuration is required when using the memory store.',
          );
        }

        const { ttl } = memoryConfig;

        return [
          new Keyv({
            ttl,
            store: new KeyvCacheableMemory({
              ttl,
              lruSize: 5000,
            }),
          }),
        ];
      },

      redis: (): Keyv[] => {
        if (!redisConfig) {
          throw new Error(
            'Redis cache configuration is required when using the Redis store.',
          );
        }

        const { host, port, password, ttl } = redisConfig;
        const auth = password ? `:${encodeURIComponent(password)}@` : '';
        const redisUrl = `redis://${auth}${host}:${String(port)}`;

        const redisStore = createKeyv(redisUrl, {
          namespace: config.appName ?? '',
        });

        redisStore.ttl = ttl;

        return [redisStore];
      },
    },
  };
}

export interface CacheModuleAsyncOptions<
  TArgs extends unknown[] = unknown[],
> extends Pick<ModuleMetadata, 'imports'> {
  inject?: FactoryProvider<CacheConfig>['inject'];
  useFactory: (...args: TArgs) => CacheConfig | Promise<CacheConfig>;
}
