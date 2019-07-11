import {SchemaDirectiveVisitor} from 'apollo-server-express'
import {defaultFieldResolver, GraphQLField} from "graphql";

export class RoleDirective extends SchemaDirectiveVisitor {

    visitFieldDefinition(field: GraphQLField<any, any>) {
        const {resolve = defaultFieldResolver} = field;

        const {roles} = this.args;

        field.resolve = async function (...args) {
            const [, , {user}] = args;

            if (roles.length && !user) {
                throw new Error("Access denied!");
            }

            let roleMapping: Map<string, string> = new Map<string, string>();
            let hasRole = false;
            user.roles.forEach((role: string) => {
                roleMapping.set(role, role);
            });

            roles.forEach((role: string) => {
                if (roleMapping.get(role)) {
                    hasRole = true;
                }
            });

            if (!hasRole) {
                throw new Error("Access denied!");
            }

            return await resolve.apply(this, args);
        };
    }
}