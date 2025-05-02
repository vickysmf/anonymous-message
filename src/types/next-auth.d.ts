import 'next-auth';
declare module 'next-auth' {
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            username?: string;
            name: string;
            email: string;
            isAcceptingMessage?: boolean;
        } & DefaultSession["user"];
    }
    interface User {
        _id?: string;
        isVerified?: boolean;
        username?: string;
        name: string;
        email: string;
        isAcceptingMessage?: boolean;
    }


}