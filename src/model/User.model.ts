import mongoose, { Schema, Document } from 'mongoose';

// Define the Message interface
export interface IMessage extends Document {
    // senderId: string;
    // receiverId: string;
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
    // senderId: {
    //     type: String,
    //     required: true
    // },
    // receiverId: {
    //     type: String,
    //     required: true
    // },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// Define the User interface
interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpire: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: IMessage[];
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required!'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
    },
    verifyCode: {
        type: String,
        required: [true, 'Verify code is required!'],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyCodeExpire: {
        type: Date,
        required: [true, 'Verify code expire is required!'],
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
});
// Create and export the User model
export const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
// Create and export the Message model
export const MessageModel = (mongoose.models.Message as mongoose.Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);
// export { MessageModel };
// export default {UserModel, MessageModel};