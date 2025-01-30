"use server";

import { AuthFormSchema } from "@/components/auth-form/auth-form-types";
import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

export const LoginRouteAction = async (
  data: z.infer<typeof AuthFormSchema>
) => {
  try {
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/signin`,
      data
    );
    const result = await response.data
    if(response && response.status !== 200){
        throw new Error(response.statusText)
    }
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      (await cookies()).set({
        name: "token",
        value: setCookieHeader[0].split(";")[0].split("=")[1],
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", 
      });
    }
    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "An error occurred during login"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred during login");
    }
  }
};
