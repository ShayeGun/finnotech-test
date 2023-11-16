import { DynamicModule, Module, Provider } from '@nestjs/common';
import { REDIS_CLIENT } from './constants';


interface OptionInterface {
  useFactory: (...args) => any;

  inject?: any[];
}

@Module({})
export class RedisModule {
  static register(otp: OptionInterface): DynamicModule {

    const RedisProvider: Provider = {
      provide: REDIS_CLIENT,
      ...otp
    };

    return {
      module: RedisModule,
      providers: [RedisProvider],
      exports: [RedisProvider],
      global: true
    };
  }
}
