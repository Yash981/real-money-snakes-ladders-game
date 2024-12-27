"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { AuthFormSchema } from "./auth-form-types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";


export const AuthForm = () => {
    const pathname = usePathname()
    const form = useForm<z.infer<typeof AuthFormSchema>>({
        resolver: zodResolver(AuthFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    const onSubmit = (data: z.infer<typeof AuthFormSchema>) => {
        console.log(data)
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
                                <Input  type="email" {...field} />
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
                                <Input  type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="">
                    <Link href={pathname === "/login" ? "/signup" : "/login"} className=" hover:underline">
                        {pathname === "/login" ? "Don't have an account? Signup" : "Already have an account? Login"}
                    </Link>
                </div>
                <Button type="submit" variant={"default"}>
                    {pathname === "/login" ? "Login" : "Signup"}
                </Button>
            </form>
        </Form>
    )
}