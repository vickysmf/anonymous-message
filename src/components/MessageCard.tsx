'use client'
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { IMessage } from '@/model/User.model';
import axios from 'axios'
import { ApiResponse } from '@/types/ApiResponse.type'
import { toast } from 'sonner'

type MessageCardProps = {
    message: IMessage;
    onMessageDelete: (messageId: string) => void;
}
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
    const date = new Date(message.createdAt)
    const formattedDate = date.toDateString()
    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        // Handle delete confirmation logic here
        console.log("Message deleted");
        toast.success(response.data.message)
        onMessageDelete(message._id as string)
    }
    return (
        <Card>
            <CardHeader className=" flex-row justify-between">
                <CardTitle>{message.content}</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger asChild className="sticky">
                        <Button variant="destructive" className="w-20 h-8 ">
                            <X className=" w-5 h-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>{formattedDate}</CardContent>
        </Card>

    )
}

export default MessageCard