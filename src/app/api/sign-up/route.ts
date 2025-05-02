import dbConnect from "@/lib/dbConnect";
import { UserModel, MessageModel } from "@/model/User.model";

import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerficationEmal";

export async function POST(req: Request) {
    console.log("running sign up route");
    
    await dbConnect();
    try {
        const { username, email, password } = await req.json()
        console.log("username", username);
        // Check if the user already exists
        const existingUserVerifiedByUsername = await UserModel
            .findOne({
                username: username,
                isVerified: true
            })
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                { status: 400 }
            );
        }
        const existingUserByEmail = await UserModel
            .findOne({
                email: email
            })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if(existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User is already exist with this email",
                    },
                    { status: 400 }
                );
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);

                // Update the existing user with the new verify code and expiry date
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpire = expiryDate;
                await existingUserByEmail.save();

            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpire: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await newUser.save();

        }
        //send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log("emailResponse", emailResponse);
        if (emailResponse.success) {
            return Response.json(
                {
                    success: true,
                    message: "User registered successfully. Please check your email to verify your account",
                },
                { status: 200 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Error sending verification email",
                },
                { status: 500 }
            );
        }
        

    } catch (error) {
        console.error("Error registering user:", error);
        return Response.json(
            {
                success: false,
                message: "Error registering user",
            },
            { status: 500 }
        );

    }
}

