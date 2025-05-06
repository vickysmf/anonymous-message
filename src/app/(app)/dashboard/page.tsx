'use client';
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { IMessage } from '@/model/User.model'
import { acceptMessageSchema } from '@/schemas/acceptMessage.schema';
import { ApiResponse } from '@/types/ApiResponse.type';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { Axios, AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { set } from 'mongoose';
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function page() {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter((message) => message._id !== messageId)
    setMessages(updatedMessages)
  }
  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  })
  const { register, watch, setValue } = form;
  const acceptMessage = watch("acceptMessageSchema");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-message`)
      setValue("acceptMessageSchema", response.data.isAcceptingMessage as boolean)

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error("Error fetching accept message", error)
      toast.error(axiosError.response?.data.message || "failed to fetch message settings")
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>(`/api/get-message`)
      setMessages(response.data.messages as IMessage[] || [])
      if (refresh) {
        toast.success("Messages refreshed successfully")
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error("Error fetching messages", error)
      toast.error(axiosError.response?.data.message || "failed to fetch messages")

    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) {
      return
    }

    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchMessages, fetchAcceptMessage])


  const handlerSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>(`/api/accept-message`, {
        acceptMessages: !acceptMessage
      })
      setValue('acceptMessageSchema', !acceptMessage)
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error("Error updating accept message", error)
      toast.error(axiosError.response?.data.message || "failed to update message settings")

    }
  }

  const { username } = session?.user
  console.log(session?.user, "session user")

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        toast.success("Link copied to clipboard")
      })
      .catch((error) => {
        console.error("Error copying link", error)
        toast.error("Failed to copy link")
      })
  }


  if (!session || !session.user) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <h1 className='text-3xl font-bold'>Please login to see your dashboard</h1>
      </div>
    )
  }
  console.log(messages, " messages")
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4"> UserDashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessageSchema')}
          checked={acceptMessage}
          onCheckedChange={handlerSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message.createdAt.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default page