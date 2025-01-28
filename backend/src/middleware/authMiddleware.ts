import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      message: "Authentication Required",
    });
    return;
  }
  try {
    const decoded = jwt.decode(token) as {
      email: string;
      iat?: number;
      exp?: number;
    };
    const currentTime = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (
      decoded.exp &&
      (currentTime >= decoded.exp * 1000 ||
        currentTime - decoded.exp * 1000 > sevenDays)
    ) {
      res.status(401).json({
        redirect: true,
        message: "Token has expired",
      });
      return;
    }
    if (decoded.iat && currentTime - decoded.iat * 1000 > sevenDays) {
      res.status(401).json({
        redirect: true,
        message: "Token is older than 7 days",
      });
      return 
    }
    const user = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string; iat?: number; exp?: number };

    //@ts-ignore
    req.user = { email: user.userId };
    next();
  } catch (error) {
    console.log(error, "errorrr");
    res.status(400).json({
      message: "Invalid Token",
    });
  }
};
