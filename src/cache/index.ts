import { ElasticacheRedis } from '@pocket-tools/apollo-utils';
import { RedisCache } from 'apollo-server-cache-redis';
import config from '../config';

export const getRedisCache = () => {
  return new ElasticacheRedis(
    new RedisCache({
      host: config.redis.primaryEndpoint.split(':')[0],
      port: config.redis.port
    }),
    new RedisCache({
      host: config.redis.readerEndpoint.split(':')[0],
      port: config.redis.port
    })
  );
};
