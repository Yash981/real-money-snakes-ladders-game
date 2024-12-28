import { Request, Response } from "express";
import { AmountSchema, AuthFormSchema } from "../types/user-types";
import {
  CreateUser,
  DepositMoneyByUserId,
  findUserByEmail,
  getAllGamesPlayedByUser,
  WithdrawMoneyByUserId,
} from "../models/user-model";
import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../services/auth-service";
import prisma from "../db/client";

export const UserSignUp = async (req: Request, res: Response) => {
  const parsedSignUpData = AuthFormSchema.safeParse(req.body);
  if (!parsedSignUpData.success) {
    res
      .status(400)
      .json({ message: "Invalid Inputs", error: parsedSignUpData.error });
    return;
  }
  try {
    const existingUser = await findUserByEmail(parsedSignUpData.data.email);
    if (existingUser) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }
    const hashedPassword = await hashPassword(parsedSignUpData.data.password);
    const newUser = await CreateUser({
      email: parsedSignUpData.data.email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "SignUp Successful", user: newUser });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
    return;
  }
};
export const UserSignIn = async (req: Request, res: Response) => {
  const parsedSignInData = AuthFormSchema.safeParse(req.body);
  if (!parsedSignInData.success) {
    res
      .status(400)
      .json({ message: "Invalid Inputs", error: parsedSignInData.error });
    return;
  }
  try {
    const existingUser = await findUserByEmail(parsedSignInData.data.email);
    console.log(existingUser, "existingUser");
    if (!existingUser) {
      res.status(400).json({ message: "User doesn't exists!" });
      return;
    }
    const verifyPassword = await comparePassword(
      parsedSignInData.data.password,
      existingUser.password
    );
    console.log(verifyPassword, "existingUser");
    if (!verifyPassword) {
      res
        .status(400)
        .json({ message: "Wrong password! Please Enter Correct Password" });
      return;
    }
    const token = generateToken(parsedSignInData.data.email);
    res.setHeader('Set-Cookie', [
      `token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; ${
        process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : 'SameSite=Lax'
      }`
    ]);
    res.status(200).json({ token });
    return;
  } catch (error) {
    res.status(500).json({ mesage: "Internal Server Error", error });
    return;
  }
};
export const DepositMoney = async (req: Request, res: Response) => {
  const parseAmountSchema = AmountSchema.safeParse(req.body);
  if (!parseAmountSchema.success) {
    res
      .status(400)
      .json({ message: "Invalid Inputs", error: parseAmountSchema.error });
    return;
  }
  try {
    if (!parseAmountSchema.data?.amount) {
      res.status(400).json({ message: "Inavlid Inputs" });
      return;
    }
    //@ts-ignore
    const updatedUser = await DepositMoneyByUserId(req.user.email,
      parseAmountSchema.data
    );
    res.status(200).json({ message: "Deposited Successfully", updatedUser });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
    return;
  }
};
export const WithdrawMoney = async (req: Request, res: Response) => {
  const parseAmountSchema = AmountSchema.safeParse(req.body);
  if (!parseAmountSchema.success) {
    res
      .status(400)
      .json({ message: "Invalid Inputs", error: parseAmountSchema.error });
    return;
  }
  try {
    //@ts-ignore
    const user = await findUserByEmail(req.user.email);
    if (
      !parseAmountSchema.data?.amount ||
      (user?.balance || 0) < parseAmountSchema.data.amount
    ) {
      res.status(400).json({ message: "Insufficient Amount to withdraw" });
      return;
    }
    //@ts-ignore
    const updatedUser = await WithdrawMoneyByUserId(req.user.email,
      parseAmountSchema.data
    );
    res.status(200).json({ message: "Withdrawn Successfully", updatedUser });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
    return;
  }
};
export const getHistoryOfGamesPlayed = async (req: Request, res: Response) => {
  if (!req.user?.email) {
    res.status(400).json({ message: "User email is required" });
    return;
  }
  const getUser = await findUserByEmail(req.user.email);
  if (!getUser) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  const TotalGamesPlayed = await getAllGamesPlayedByUser({ id: getUser.id });

  res.status(200).json({
    message: "History of Games Played",
    TotalGamesPlayed,
  })

}
export const getCurrentBalance = async (req: Request, res: Response) => {
  if (!req.user?.email) {
    res.status(400).json({ message: "User email is required" });
    return;
  }
  const getUser = await findUserByEmail(req.user.email);
  if (!getUser) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  res.status(200).json({
    message: "Current Balance",
    balance: getUser.balance,
  });
}