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
  const { host, port, password } = config.redis;
  const auth = password ? `:${encodeURIComponent(password)}@` : '';
  const redisUrl = `redis://${auth}${host}:${String(port)}`;
  const ttl = config.memory.ttl;

  return {
    defaultStore: config.defaultStore,
    stores: {
      memory: () => [
        new Keyv({
          ttl,
          store: new KeyvCacheableMemory({
            ttl,
            lruSize: 5000,
          }),
        }),
      ],
      redis: () => {
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
