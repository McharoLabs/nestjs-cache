import {
  CacheModule as NestCacheModule,
  type CacheOptions,
} from '@nestjs/cache-manager';
import { Global, Module, type DynamicModule } from '@nestjs/common';

import {
  createCacheConfig,
  type CacheModuleAsyncOptions,
} from './config/cache.config';
import { CACHE_CONFIG } from './constants/cache.constants';
import { CacheService } from './services/cache.service';
import type { CacheConfig } from './types/cache.types';

@Global()
@Module({})
export class CacheModule {
  private static getStores(
    config: CacheConfig,
  ): NonNullable<CacheOptions<Record<string, unknown>>['stores']> {
    const builtConfig = createCacheConfig(config);

    return builtConfig.stores[config.defaultStore]() as unknown as NonNullable<
      CacheOptions<Record<string, unknown>>['stores']
    >;
  }

  public static forRoot(config: CacheConfig): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        NestCacheModule.register<Record<string, unknown>>({
          stores: this.getStores(config),
        }),
      ],
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
        },
        CacheService,
      ],
      exports: [CacheService, CACHE_CONFIG],
    };
  }

  public static forRootAsync<TArgs extends unknown[] = unknown[]>(
    options: CacheModuleAsyncOptions<TArgs>,
  ): DynamicModule {
    @Module({
      imports: options.imports ?? [],
      providers: [
        {
          provide: CACHE_CONFIG,
          useFactory: options.useFactory,
          ...(options.inject !== undefined ? { inject: options.inject } : {}),
        },
      ],
      exports: [CACHE_CONFIG],
    })
    class CacheConfigModule {}

    return {
      module: CacheModule,
      imports: [
        CacheConfigModule,
        NestCacheModule.registerAsync<Record<string, unknown>>({
          imports: [CacheConfigModule],
          inject: [CACHE_CONFIG],
          useFactory: (config: CacheConfig) => ({
            stores: this.getStores(config),
          }),
        }),
      ],
      providers: [
        {
          provide: CACHE_CONFIG,
          useFactory: options.useFactory,
          ...(options.inject !== undefined ? { inject: options.inject } : {}),
        },
        CacheService,
      ],
      exports: [CacheService, CACHE_CONFIG],
    };
  }
}
