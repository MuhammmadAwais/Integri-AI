import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import chatReducer from "./chatSlice";
import authReducer from "./authSlice"; // New
import { chatApi } from "../store/apis/chatAPI";
import { authApi } from "../store/apis/authAPI"; // New

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    auth: authReducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(chatApi.middleware)
      .concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
