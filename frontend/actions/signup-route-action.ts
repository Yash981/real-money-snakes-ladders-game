"use server"

import { AuthFormSchema } from "@/components/auth-form/auth-form-types"
import axios from "axios"
import { z } from "zod"



export const signupRouteAction = async (data: z.infer<typeof AuthFormSchema>) => {
    try {
        const response = await axios.post(`${process.env.BACKEND_URL}/api/v1/signup`, data)
        return { success: true, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message)
            return { success: false, error: error.response?.data?.message || 'An error occurred during signup' };
        } else {
            return { success: false, error: error || 'An error occurred during signup' };
        }
    }
}