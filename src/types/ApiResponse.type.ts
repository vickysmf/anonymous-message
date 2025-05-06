import { IMessage } from "@/model/User.model";
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?: IMessage[];

}