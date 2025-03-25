import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
    private static instance: RedisService;
    private redis: Redis;

    private constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redis.on('error', (error: Error) => {
            console.error('Redis connection error:', error);
        });

        this.redis.on('connect', () => {
            console.log('Successfully connected to Redis');
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public getClient(): Redis {
        return this.redis;
    }

    public async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.set(key, value, 'EX', ttl);
        } else {
            await this.redis.set(key, value);
        }
    }

    public async get(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }

    public async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    public async exists(key: string): Promise<boolean> {
        const result = await this.redis.exists(key);
        return result === 1;
    }
}

const redisService = RedisService.getInstance();
export default redisService;
