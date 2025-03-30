import Redis from 'ioredis';
import dotenv from 'dotenv';
import prisma from '../db/client';

dotenv.config();

class RedisService {
    private static instance: RedisService;
    private redis: Redis;
    private syncInterval: NodeJS.Timeout | null = null;

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
            
            this.startPeriodicSync();
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

    public async saveGameState(gameId: string, gameState: any): Promise<void> {
        await this.set(`game:${gameId}`, JSON.stringify(gameState));
        
        await this.redis.sadd('active_games', gameId);
    }

    public async getGameState(gameId: string): Promise<any | null> {
        const state = await this.get(`game:${gameId}`);
        return state ? JSON.parse(state) : null;
    }

    public async markGameCompleted(gameId: string): Promise<void> {
        await this.redis.srem('active_games', gameId);
        await this.redis.sadd('completed_games', gameId);
    }

    public async getAllActiveGames(): Promise<string[]> {
        return await this.redis.smembers('active_games');
    }

    public async getAllCompletedGames(): Promise<string[]> {
        return await this.redis.smembers('completed_games');
    }

    private async startPeriodicSync(): Promise<void> {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        const activeGames = await this.getAllActiveGames();
        const completedGames = await this.getAllCompletedGames();
        if(activeGames.length <= 0 || completedGames.length <= 0){
            return;
        }
        const syncPeriod = parseInt(process.env.REDIS_SYNC_INTERVAL || '60000', 10);
        this.syncInterval = setInterval(() => this.syncWithDatabase(), syncPeriod);
        console.log(`Started periodic Redis-Database sync every ${syncPeriod}ms`);
    }

    public async syncWithDatabase(): Promise<void> {
        try {
            console.log('Starting Redis-Database synchronization...');
            
            const completedGames = await this.getAllCompletedGames();
            for (const gameId of completedGames) {
                const gameState = await this.getGameState(gameId);
                if (gameState) {
                    console.log(gameState,'completed gamestate')
                    await prisma.game.upsert({
                        where: { gameId },
                        update: {
                            status: 'COMPLETED',
                            state: gameState.state || {},
                            winner: gameState.winner || null,
                            updatedAt: new Date()
                        },
                        create: {
                            gameId,
                            status: 'COMPLETED',
                            state: gameState.state || {},
                            winner: gameState.winner || null,
                            betAmount: gameState.betAmount || 0.0,
                            players: {
                                connect: Object.entries(gameState.players as Record<string, { position: number; email: string }>).map(([key, player]) => {
                                    console.log('Email:completed', player);
                                    return { email: player.email };
                                }),
                            }
                        }
                    });
                    
                    await this.del(`game:${gameId}`);
                    await this.redis.srem('completed_games', gameId);
                }
            }
            
            const activeGames = await this.getAllActiveGames();
            for (const gameId of activeGames) {
                const gameState = await this.getGameState(gameId);
                if (gameState && gameState.status !== 'WAITING') {
                    console.log(gameState,'gameState, active')
                    await prisma.game.upsert({
                        where: { gameId },
                        update: {
                            status: 'IN_PROGRESS',
                            state: gameState.state || {},
                            updatedAt: new Date()
                        },
                        create: {
                            gameId,
                            status: 'IN_PROGRESS',
                            state: gameState.state || {},
                            betAmount: gameState.betAmount || 0.0,
                            players: {
                                connect: Object.entries(gameState.players as Record<string, { position: number; email: string }>).map(([key, player]) => {
                                    console.log('Email:', player);
                                    return { email: player.email };
                                }),
                            },
                        }
                    });
                }
            }
            
            console.log('Redis-Database synchronization completed successfully');
        } catch (error) {
            console.error('Error during Redis-Database sync:', error);
        }
    }
}

const redisService = RedisService.getInstance();
export default redisService;
