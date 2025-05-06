import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import { User } from 'next-auth';
import { MessageModel } from "@/model/User.model";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req: Request) {
    await dbConnect();
    const { username, content } = await req.json();
    try {
        const user = await UserModel.findOne({ username: username })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                { status: 403 }
            );
        }
        const newMessage = new MessageModel({
            content: content, createdAt: new Date()
        });
        user.messages.push(newMessage)
        await user.save();
        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
                data: newMessage,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error sending message. failed to send message", error);
        return Response.json(
            {
                success: false,
                message: "Error sending message. failed to send message",
            },
            { status: 500 }
        );

    }
}