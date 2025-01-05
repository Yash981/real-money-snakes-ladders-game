"use server"
import axios from "axios"
import { cookies } from "next/headers"



export const logoutRouteAction = async () => {
    const token = (await cookies()).get('token')?.value
    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/api/v1/logout`,{
            headers: {
                "Cookie": token ? `token=${token}` : ''
            },
        })
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message)
            throw new Error(error.response?.data?.message || 'An error occurred during logout')
        } else {
            console.error('Unexpected error:', error)
            throw new Error('An unexpected error occurred during logout')
        }
    }
}