import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse.type";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Anonymous Message || Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        if (error) {
            console.error("Error sending email", error);
            return {
                success: false,
                message: "Error sending verification email",
            }
        }
        console.log("Email sent successfully", data);
        return {
            success: true,
            message: "Verification email sent successfully",
        }

    } catch (err) {
        console.error("Error sending verification email", err);
        return {
            success: false,
            message: "Error sending verification email",
        }
    }
}