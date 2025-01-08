"use server"

import axios from "axios"
import { cookies } from "next/headers"

export const verifyGameId = async(data:string) =>{
    const token = (await cookies()).get('token')?.value
    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/api/v1/verify-game-id/${data}`,{
            
            headers:{
                "Cookie": token ? `token=${token}` :""
            },
        })
        if(response.status !== 200){
            return {success: false,message: response.statusText}
        }
        return {success: true,message:response.data}
    } catch (error) {
        return {success: false,message: 'Failed to verify GameId'}
    }
}