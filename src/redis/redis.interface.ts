import { ModuleMetadata } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface RedisAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * The `useExisting` syntax allows you to create aliases for existing providers.
   */
  useExisting?: any;
  /**
   * The `useClass` syntax allows you to dynamically determine a class
   * that a token should resolve to.
   */
  useClass?: any;
  /**
   * The `useFactory` syntax allows for creating providers dynamically.
   */
  useFactory?: (...args: any[]) => Promise<any> | any;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: any[];
}