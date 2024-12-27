"use server"

import { AuthFormSchema } from "@/components/auth-form/auth-form-types"
import axios from "axios"
import { z } from "zod"



export const LoginRouteAction = async (data: z.infer<typeof AuthFormSchema>) => {
    try {
        const response = await axios.post(`${process.env.BACKEND_URL}/api/v1/signin`, data)
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message)
            throw new Error(error.response?.data?.message || 'An error occurred during login')
        } else {
            console.error('Unexpected error:', error)
            throw new Error('An unexpected error occurred during login')
        }
    }
}