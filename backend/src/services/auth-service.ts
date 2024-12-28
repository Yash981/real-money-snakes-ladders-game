import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/user-model';

const JWT_SECRET = process.env.JWT_SECRET || 'Yashwanth14';
const JWT_EXPIRATION = '1d';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};
export const verifyWSToken = async (ws:any,req:any) => {
  console.log(req,req.headers['sec-websocket-protocol']);
  const protocols = req.headers['sec-websocket-protocol'] 
  if(!protocols){
    throw new Error("Missing Sec-WebSocket-Protocol header");
  }
    const token = protocols.split(",")[1]?.trim() ;
    console.log(token,'token middleware');
    if(ws.protocol !== 'access_token' || !token){
      ws.close(1008,'Unauthorized')
      return
    }
    const user = jwt.verify(token!, process.env.JWT_SECRET as string) as any
    console.log(user,'user middleware');
    return await findUserByEmail(user.userId)
};