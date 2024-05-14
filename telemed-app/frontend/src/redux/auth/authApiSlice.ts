import { getTenantSlug } from "../../Helpers/utils";
import { apiSlice } from "../apiSlice";
import { AuthData } from "./authSlice";

export type LoginForm = { email: string; password: string };
type credentials = LoginForm & {
  client_id: string;
};

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthData, credentials>({
      query: (credentials: credentials) => ({
        url: "/auth/login-token",
        params: {
          tenantSlug: getTenantSlug(),
        },
        method: "POST",
        body: { ...credentials },
      }),
    }),
    logout: builder.mutation({
      query: (refreshToken: string | null) => ({
        url: "/logout",
        params: {
          tenantSlug: getTenantSlug(),
        },
        method: "POST",
        body: { refreshToken },
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApiSlice;
