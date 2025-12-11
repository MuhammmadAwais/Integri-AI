import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import chatReducer from "../features/chat/chatSlice"; //  UI slice 
import authReducer from "../features/auth/slices/authSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
