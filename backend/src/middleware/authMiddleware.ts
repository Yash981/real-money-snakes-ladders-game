import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
export const userMiddleware = (req:Request,res:Response,next:NextFunction) =>{
    //@ts-ignore
    const token = req.cookies.token
    if(!token){
        res.status(401).json({
            message:"Authentication Required"
        })
        return;
    }
    try {
        const decoded = jwt.verify(token as string,process.env.JWT_SECRET as string) as { email: string}
        console.log(decoded,'decodedd')
        //@ts-ignore
        req.user = {email:decoded.userId};
        next()
    } catch (error) {
        console.log(error,'errorrr')
        res.status(400).json({
            message: 'Invalid Token'
        })
    }
}