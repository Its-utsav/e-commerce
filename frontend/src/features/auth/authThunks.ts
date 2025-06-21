import { createAsyncThunk } from "@reduxjs/toolkit";
import authservice from "../../services/auth/auth";
import type { LoginUserData } from "../../types/user.types";

export const loginUser = createAsyncThunk("auth/login", async (credentials: LoginUserData, thunkAPI) => {
    try {
        authservice.login(credentials)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})