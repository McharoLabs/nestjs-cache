import {
  CacheModule as NestCacheModule,
  type CacheOptions,
} from '@nestjs/cache-manager';
import { Module, type DynamicModule } from '@nestjs/common';

import {
  createCacheConfig,
  type CacheModuleAsyncOptions,
} from './config/cache.config';
import { CACHE_CONFIG } from './constants/cache.constants';
import { CacheService } from './services/cache.service';
import type { CacheConfig } from './types/cache.types';

@Module({})
export class CacheModule {
  private static getStores(
    config: CacheConfig,
  ): NonNullable<CacheOptions<Record<string, unknown>>['stores']> {
    const builtConfig = createCacheConfig(config);

    return builtConfig.stores[config.defaultStore]();
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
    const configProvider = {
      provide: CACHE_CONFIG,
      useFactory: options.useFactory,
      ...(options.inject !== undefined ? { inject: options.inject } : {}),
    };

    return {
      module: CacheModule,
      imports: [
        NestCacheModule.registerAsync<Record<string, unknown>>({
          ...(options.imports !== undefined
            ? { imports: options.imports }
            : {}),
          inject: [CACHE_CONFIG],
          useFactory: (config: CacheConfig) => ({
            stores: this.getStores(config),
          }),
        }),
      ],
      providers: [configProvider, CacheService],
      exports: [CacheService, CACHE_CONFIG],
    };
  }
}
