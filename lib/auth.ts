import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "./db";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins"
import { findUserRole } from "./auth-utils";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
            prompt: "select_account",
        }
    },
    plugins: [customSession(async ({user, session}) => {
        const role = await findUserRole(session.userId)

        return {
            user: {
                ...user,
                role: role
            },
            session
        }

    }), 
        
        nextCookies()]
});