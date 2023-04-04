import {ConfigService} from "@nestjs/config";
import {redisStore} from "cache-manager-redis-yet";

export const getRedisConfig = async (configService: ConfigService) => ({
  store: redisStore,
  // host: configService.get<string>('REDIS_HOST'),
  // port: configService.get<number>('REDIS_PORT'),
  url: `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`,
  ttl: configService.get('REDIS_TTL'),
})