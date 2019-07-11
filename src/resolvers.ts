import {IResolvers} from "graphql-tools";
import * as bcrypt from "bcryptjs";
import moment from "moment";
import {User} from "./entity/User";
import {validate} from "class-validator";
import {jwtSign} from "./auth";
import {pubsub, TOPICS} from "./pubsub";

export const resolvers: IResolvers = {
    Query: {
        me: (_, __, {user}) => {

            if (!user) {
                throw new Error("Access denied!");
            }

            return user;
        },
        users: async () => {
            return await User.find();
        }
    },

    Mutation: {

        register: async (_, {firstName, lastName, email, password}) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            let user = new User();
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.password = hashedPassword;
            user.created = moment().unix();
            user.roles = ["authenticated"];
            const errors = await validate(user);
            if (errors.length) {
                throw new Error("Validation failed!")
            } else {
                user = await user.save();
                pubsub.publish(TOPICS.userCreated, {[TOPICS.userCreated]: user});
                return user;
            }

        },

        updateUser: async (_, {id, input}) => {
            let user = await User.findOne(id);
            if (!user) {
                throw new Error("User not found!");
            } else {
                user.firstName = input.firstName;
                user.lastName = input.lastName;
                user.email = input.email;
                user.updated = moment().unix();

                let errors = await validate(user);
                if (errors.length) {
                    throw new Error("Validation failed!")
                } else {
                    return await user.save();
                }

            }
        },

        login: async (_, {email, password}) => {

            const user = await User.findOne({where: {email}});
            if (!user) {
                throw new Error("User not found!")
            } else {
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    throw new Error("Password does not match!");
                } else {

                    const expired = moment().add('1', 'hour').unix();
                    return {
                        token: jwtSign(user.id, expired),
                        expired: expired,
                        user: user,
                    }
                }
            }
        }
    },

    Subscription: {
        userCreated: {
            subscribe: () => pubsub.asyncIterator(TOPICS.userCreated),
        },
    },
};
