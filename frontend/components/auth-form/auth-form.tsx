"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { AuthFormSchema } from "./auth-form-types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { LoginRouteAction } from "@/actions/login-route-action";
import { signupRouteAction } from "@/actions/signup-route-action";


export const AuthForm = () => {
    const [error , setError] = useState<string | null>(null)
    const pathname = usePathname()
    const router = useTransitionRouter()
    const form = useForm<z.infer<typeof AuthFormSchema>>({
        resolver: zodResolver(AuthFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    const onSubmit = async (data: z.infer<typeof AuthFormSchema>) => {
        const parsedData = AuthFormSchema.safeParse(data)
        if (!parsedData.success) {
            return setError(parsedData.error.errors[0].message)
        }
        if(pathname === "/login"){
            try {
                const response = await LoginRouteAction(data)
                console.log(response)
                if(response && response.token){
                    localStorage.setItem('wsToken',response.token)
                }
                router.push("/")
            } catch (error) {
                setError((error as Error).message)
            }
        } else {
            try {
                const response = await signupRouteAction(data)
                console.log(response)
                router.push("/login")
            } catch (error) {
                setError((error as Error).message)
            }
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormMessage>{error}</FormMessage>
                <div className="flex">
                    <Link href={pathname === "/login" ? "/signup" : "/login"} className="flex">
                        {pathname === "/login" ? "Don't have an account? " : "Already have an account? " }<p className="hover:underline">{pathname !== "/login" ? ' Login' : ' Signup'}</p>
                    </Link>
                </div>
                <Button type="submit" variant={"default"} className="w-full">
                    {pathname === "/login" ? "Login" : "Signup"}
                </Button>
            </form>
        </Form>
    )
}