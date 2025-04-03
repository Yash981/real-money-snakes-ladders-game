import { z } from "zod";
import prisma from "../db/client"
import { AmountSchema, AuthFormSchema } from '../types/user-types'
type UserSignUpData = z.infer<typeof AuthFormSchema>;
type AmountTypeData = z.infer<typeof AmountSchema>
export const findUserByEmail = async (email:string) =>{
    return await prisma.user.findUnique({
        where:{ email }
    })
}
export const CreateUser = async (userData : UserSignUpData) =>{
    return await prisma.user.create({
        data:{
            email:userData.email,
            password: userData.password
        }
    })

}
export const DepositMoneyByUserId =  async(email: string,{amount}:AmountTypeData) =>{
    return await prisma.user.update({
        where:{ email },
        data:{
            balance:{ increment:amount},
        }
    })
}
export const WithdrawMoneyByUserId = async(email:string,{amount}:AmountTypeData)=>{
    return await prisma.user.update({
        where:{
            email
        },
        data:{
            balance:{decrement:amount}
        }
    })
}
export const getAllGamesPlayedByUser = async(getUser:{email:string}) =>{
    return await prisma.game.findMany({
        where: {
          status: 'COMPLETED',
          players: {
            some: {
              email: getUser.email
            }
          }
        },
        include: {
          players: {
            select:{
                email:true,
                balance:true,
                createdAt:true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
    })
}