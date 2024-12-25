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
export const verifyWSToken = async (req:any) => {
  const cookies = req.header.cookie;
    const token = cookies;
    const user = jwt.verify(token!, process.env.JWT_SECRET as string) as any
    return await findUserByEmail(user.userId)
};