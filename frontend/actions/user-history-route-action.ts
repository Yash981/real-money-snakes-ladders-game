"use server"

import axios from "axios"
import { cookies } from "next/headers"

export const getUserHistory = async() =>{
    const token = (await cookies()).get('token')?.value
    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/api/v1/user/history`,{
            headers:{
                "Cookie": token? `token=${token}`: ''
            }
        })
        if(response.status !== 200){
            return {success:false,message:`Error fetching user history: ${response.statusText}`}
        }
        return {success:true,message:response.data}
    } catch (error) {
        return {success:false,message:`Internal server error: ${error}`}
    }
}