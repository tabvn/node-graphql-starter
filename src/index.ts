import "reflect-metadata";
import "dotenv/config";
import {createConnection} from "typeorm";
import {ApolloServer} from "apollo-server-express";
import express from "express";
import {typeDefs} from "./typeDefs";
import {resolvers} from "./resolvers";
import {PORT} from "./config";
import {getTokenFromRequest, getUserIdFromToken} from "./auth";
import {User} from "./entity/User";
import http from 'http';
import {RoleDirective} from "./directives";

const startServer = async () => {

    const server = new ApolloServer({
        // These will be defined for both new or existing servers
        typeDefs,
        resolvers,
        context: async ({req}) => {
            if (req) {
                const token = getTokenFromRequest(req);
                let user = null;
                if (token != "") {
                    const userId = await getUserIdFromToken(token);
                    user = await User.findOne(userId, {cache: {id: `user:${userId}`, milliseconds: 30000}});
                }
                return {user};
            }
            return {req};

        },
        subscriptions: {
            onConnect: async (connectionParams: any) => {
                let user = null;
                if (connectionParams.authToken) {
                    const userId = await getUserIdFromToken(connectionParams.authToken);
                    user = await User.findOne(userId);
                }

                return {user};
            }
        },
        schemaDirectives: {
            hasRole: RoleDirective
        }
    });


    await createConnection();

    const app = express();

    server.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: "http://localhost:3000"
        }
    });

    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);

    httpServer.listen({port: PORT}, () =>
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    );
};

startServer().catch((e) => {
    throw e;
});