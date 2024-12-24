import { Router } from "express";
import { DepositMoney, UserSignIn, UserSignUp, WithdrawMoney } from "../controllers/user-controller";
import { userMiddleware } from "../middleware/authMiddleware";

export const UserRouter = Router()

UserRouter.post('/signup',UserSignUp)
UserRouter.post('/signin',UserSignIn)
UserRouter.post('/account/deposit',userMiddleware,DepositMoney)
UserRouter.post('/account/withdraw',userMiddleware,WithdrawMoney)

