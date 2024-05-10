import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { REDIS_OPTIONS } from './constants';
import {RedisAsyncOptions} from './redis.interface';
import {RedisProvider} from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static register(options: RedisAsyncOptions): DynamicModule {

    const providers = [...this.createAsyncProviders(options), RedisProvider];
    return {
      module: RedisModule,
      imports: options.imports || [],
      providers,
      exports: providers,
    };
  }

  private static createAsyncProviders(options: RedisAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: RedisAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: REDIS_OPTIONS,
      useFactory: async (optionsFactory: any) =>
        await optionsFactory.createThrottlerOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
