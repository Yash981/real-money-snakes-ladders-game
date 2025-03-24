import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import url from "url";
import { User } from "../websocket/socket-manager";
import { userJwtClaims } from "../types/event-types";

const JWT_SECRET = process.env.JWT_SECRET || "Yashwanth14";
const JWT_EXPIRATION = "7d";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};
export const verifyWSToken = async (ws: any, req: any) => {
  const token = url.parse(req.url, true).query.token as string;
  const decoded = jwt.decode(token) as userJwtClaims;

  const currentTime = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  if (
    decoded.exp &&
    (currentTime >= decoded.exp * 1000 ||
      currentTime - decoded.exp * 1000 > sevenDays)
  ) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        payload: {
          redirect: true,
          message: "Token has expired",
        },
      })
    );
    return;
  }
  if (decoded.iat && currentTime - decoded.iat * 1000 > sevenDays) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        payload: {
          redirect: true,
          message: "Token is older than 7 days",
        },
      })
    );
    return;
  }
  const user = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as userJwtClaims;
  console.log(user, "user"); 
  
  console.log(token, user);
  return new User(ws, user);
};
