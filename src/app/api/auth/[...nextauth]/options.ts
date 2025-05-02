import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import GitLab from "next-auth/providers/gitlab";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any, req): Promise<any> {
                await dbConnect();
                try {

                    const user = await UserModel.findOne({
                        // email: credentials.email 
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error("User not found with this email or username");
                    }
                    if (!user.isVerified) {
                        throw new Error("User is not verified. Please verify your email address.");
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error("Invalid credentials. Please try again.");
                    } else {
                        // return {
                        //     id: user._id,
                        //     name: user.username,
                        //     email: user.email,
                        //     isAcceptingMessage: user.isAcceptingMessage,
                        // };
                        return user;
                    }
                } catch (err) {
                    console.log(err);
                    throw new Error("Database connection error");
                }
            }
        })

    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.email = user.email;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token 
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id?.toString();
                session.user.isVerified = token.isVerified;
                session.user.email = token.email;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
                session.user.username = token.username;
            }
            return session
        }
    },
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

