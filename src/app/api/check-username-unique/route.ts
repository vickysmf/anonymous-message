import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUp.schema";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
   
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        };
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log("result", result);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];

            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(',') : "Invalid query parameter",
                    errors: result.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }
        const { username } = result.data;
        console.log("username", username);
        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                { status: 409 }
            );
        }
        return Response.json(
            {
                success: true,
                message: "Username is available",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username uniqueness",
            },
            { status: 500 }
        );
    }
}