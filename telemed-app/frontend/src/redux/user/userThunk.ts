import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../auth/user.model";
import { RootState } from "../store";
import useConfig from "../../Hooks/useConfig";

export const fetchUserData = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/fetchUser", async (_, { rejectWithValue, getState }) => {
  try {
    const rootState = getState() as RootState;
    const { accessToken } = rootState.auth;
    const { config: configData } = useConfig();
    const authBaseUrl = configData?.authApiBaseUrl || "";

    const response = await fetch(`${authBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken!}`,
      },
    });
    return (await response.json()) as User;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});
