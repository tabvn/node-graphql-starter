import {RedisPubSub} from 'graphql-redis-subscriptions';
import {REDIS_HOST, REDIS_PORT} from "./config";

export const pubsub = new RedisPubSub({
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});

export const TOPICS = {
    userCreated: 'userCreated',
};
