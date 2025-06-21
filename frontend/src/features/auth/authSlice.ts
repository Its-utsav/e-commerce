import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./authThunks";

const userToken = localStorage.getItem("userToken");

interface UserState {
    userToken: string | null;
    loading: boolean;
    error?: null | string
    success: boolean;
    userInfo: any
}

const initialState: UserState = {
    loading: false,
    userToken,
    error: null,
    success: false,
    userInfo: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            localStorage.setItem("userToken", JSON.stringify(action.payload));
            state.success = true;
            state.userInfo = action
        },
        logout: (state) => {
            localStorage.removeItem("userToken");
            state.loading = false;
            state.error = null;
            state.success = false;
            state.userInfo = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
    },
});

export const { logout, login } = authSlice.actions;
export default authSlice.reducer;
