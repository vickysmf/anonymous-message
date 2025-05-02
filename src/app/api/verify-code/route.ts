import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUp.schema";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({
            username: decodedUsername,
        })
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpire) > new Date();
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account is verified successfully",
                },
                { status: 200 }
            );
        }else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification Code is expired. please signup again to get a new Code",
                },
                { status: 400 }
            );
        }else if (!isCodeValid) {
            return Response.json(
                {
                    success: false,
                    message: "Verification Code is incorrect.",
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error verifying user", error);
        return Response.json(
            {
                success: false,
                message: "Error verifying user",
            },
            { status: 500 }
        );
    }
}