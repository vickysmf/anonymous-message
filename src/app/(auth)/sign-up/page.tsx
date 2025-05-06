'use client'

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import Link from "next/link"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { sign } from "crypto"
import { signUpSchema } from "@/schemas/signUp.schema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse.type"
import { set } from "mongoose"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react';

function page() {
    const [username, setUserName] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [userNameMessageStatus, setUserNameMessageStatus] = useState(false);
    const [isCheckingUserName, setIsCheckingUserName] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedUserName = useDebounceCallback(setUserName, 300);
    const router = useRouter();

    // toast("Event has been created.")

    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            username: "",
        },
    });

    useEffect(() => {
        const checkUserNameUnique = async () => {
            if (username) {
                setIsCheckingUserName(true);
                setUsernameMessage("");
                setUserNameMessageStatus(false);
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`);
                    setUsernameMessage(response.data.message);
                    setUserNameMessageStatus(response.data.status);
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message || "Error checking username");


                } finally {
                    setIsCheckingUserName(false);
                }
            }
        }
        checkUserNameUnique();
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>("/api/sign-up", data);
            if (response.status === 201) {
                toast.success("Account created successfully", { description: response.data.message });
                router.replace(`/verify/${username}`);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message;
            toast.error(errorMessage || "Error in signing up", { description: errorMessage });
            console.error('Error in signing up:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-fuchsia-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debouncedUserName(e.target.value)
                                            }
                                            }
                                        />
                                    </FormControl>
                                    {
                                        isCheckingUserName && <Loader2 className="animate-spin" />

                                    }
                                    {usernameMessage && <p className={`text-sm ${userNameMessageStatus !== false && usernameMessage !== '' ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessage}
                                    </p>
                                    }
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email"
                                            {...field}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input 
                                        placeholder="password"
                                        type="password"
                                            {...field}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h4 w-4 animate-spin" /> Please Wait ...
                                    </>
                                ) : "Sign Up"
                            }
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page