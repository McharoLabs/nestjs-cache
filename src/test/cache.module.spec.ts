import { describe, expect, it, jest } from '@jest/globals';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import type { DynamicModule, Provider } from '@nestjs/common';

import { CacheModule } from '../cache.module';
import { CACHE_CONFIG } from '../constants/cache.constants';
import { CacheService } from '../services/cache.service';
import type { CacheConfig } from '../types/cache.types';

describe('CacheModule', () => {
  const config: CacheConfig = {
    appName: 'test-app',
    defaultStore: 'memory',
    redis: {
      host: 'localhost',
      port: 6379,
    },
    memory: {
      ttl: 60_000,
    },
  };

  it('should register the module with synchronous configuration', () => {
    const dynamicModule = CacheModule.forRoot(config);

    expect(dynamicModule.module).toBe(CacheModule);
    expect(dynamicModule.imports).toHaveLength(1);
    expect(dynamicModule.providers).toContain(CacheService);
    expect(dynamicModule.exports).toEqual([CacheService, CACHE_CONFIG]);
  });

  it('should provide the supplied configuration', () => {
    const dynamicModule = CacheModule.forRoot(config);
    const configProvider = dynamicModule.providers?.find(
      (provider: Provider) =>
        typeof provider === 'object' &&
        'provide' in provider &&
        provider.provide === CACHE_CONFIG,
    );

    expect(configProvider).toEqual({
      provide: CACHE_CONFIG,
      useValue: config,
    });
  });

  it('should register the Nest cache module', () => {
    const dynamicModule = CacheModule.forRoot(config);

    expect(dynamicModule.imports?.[0]).toBeDefined();

    // The registered import is the dynamic module returned by Nest's cache module.
    expect(NestCacheModule).toBeDefined();
  });

  it('should register the module with asynchronous configuration', () => {
    const useFactory = jest.fn(() => Promise.resolve(config));

    const dynamicModule: DynamicModule = CacheModule.forRootAsync({
      useFactory,
    });

    expect(dynamicModule.module).toBe(CacheModule);
    expect(dynamicModule.imports).toHaveLength(1);
    expect(dynamicModule.providers).toContain(CacheService);
    expect(dynamicModule.exports).toEqual([CacheService, CACHE_CONFIG]);
  });

  it('should register an asynchronous configuration provider', () => {
    const useFactory = jest.fn(() => Promise.resolve(config));

    const dynamicModule = CacheModule.forRootAsync({
      useFactory,
    });

    const configProvider = dynamicModule.providers?.find(
      (provider: Provider) =>
        typeof provider === 'object' &&
        'provide' in provider &&
        provider.provide === CACHE_CONFIG,
    );

    expect(configProvider).toEqual({
      provide: CACHE_CONFIG,
      useFactory,
      inject: undefined,
    });
  });
});
