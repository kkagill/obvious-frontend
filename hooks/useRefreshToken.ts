"use client";

import { clientBackendPublic } from "@/libs/axios";
import { useSession } from "next-auth/react";

export const useRefreshToken = () => {
  const { update, data: session } = useSession();

  const refreshToken = async () => {
    const res = await clientBackendPublic.post("/auth/refresh-tokens", {
      refreshToken: session?.user.jwt.refresh.token,
    });
    
    // update session
    await update({
      ...session,
      user: {
        ...session?.user,
        jwt: res.data.jwt,
      }
    });
  };

  return refreshToken;
};