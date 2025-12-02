import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import chatReducer from "./chatSlice";
import { chatApi } from "../store/apis/chatAPI";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
