import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import chatReducer from "../features/chat/chatSlice";
import authReducer from "../features/auth/slices/authSlice";
import { chatApi } from "../features/chat/services/chatService";


export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    auth: authReducer, 
    [chatApi.reducerPath]: chatApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
