"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRefreshToken } from "./useRefreshToken";
import { clientBackendAuth } from "@/libs/axios";

const useInterceptor = () => {
  const { data: session } = useSession();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = clientBackendAuth.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${session?.user.jwt.access.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    const responseIntercept = clientBackendAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          await refreshToken();
          prevRequest.headers["Authorization"] = `Bearer ${session?.user.jwt.access.token}`;
          return clientBackendAuth(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      clientBackendAuth.interceptors.request.eject(requestIntercept);
      clientBackendAuth.interceptors.response.eject(responseIntercept);
    };
  }, [session, refreshToken]);

  return clientBackendAuth;
};

export default useInterceptor;