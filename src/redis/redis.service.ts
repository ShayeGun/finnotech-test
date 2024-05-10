import { REDIS_CLIENT, REDIS_OPTIONS } from './constants';
import { Redis } from 'ioredis';

export const RedisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (options: any) => {
    return new Redis(options);
  },
  inject: [REDIS_OPTIONS],
};