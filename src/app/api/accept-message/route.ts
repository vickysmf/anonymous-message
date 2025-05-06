import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import { User } from 'next-auth';

export async function POST(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "user not authenticated",
            },
            { status: 401 }
        );
    }
    const userId = user._id;
    const { acceptMessages } = await req.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage: acceptMessages,
            },
            { new: true }
        );
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        } else {
            return Response.json(
                {
                    success: true,
                    message: "User accepting messages status updated successfully",
                    data: updatedUser,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Error accepting messages. failed to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Error accepting messages. failed to accept messages",
            },
            { status: 500 }
        );

    }
}

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "user not authenticated",
            },
            { status: 401 }
        );
    }
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        } else {
            return Response.json(
                {
                    success: true,
                    message: "User accepting messages status fetched successfully",
                    isAcceptingMessage: foundUser.isAcceptingMessage,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Error accepting messages. failed to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Error accepting messages. failed to accept messages",
            },
            { status: 500 }
        );

    }
}