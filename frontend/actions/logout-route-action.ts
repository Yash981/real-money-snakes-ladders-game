"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logoutRouteAction = async () => {
  try {
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/logout`
    );
    console.log(response.status,(await cookies()).getAll('token'))
    if (response.status === 200) {
      (await cookies()).delete({
        name: "token",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      // console.log('cookie cleared')
    }
    // console.log(response.data, "response data");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "An error occurred during logout"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred during logout");
    }
  }
  redirect("/signup");
};
