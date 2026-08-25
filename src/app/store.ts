import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";
import chatReducer from "../features/chat/chatSlice"; //  UI slice 
import authReducer from "../features/auth/slices/authSlice";
import agentsReducer from "../features/agents/agentsSlice";
import subscriptionReducer from "../features/subscriptions/slices/subscriptionSlice";
import limitsReducer from "../features/limits/slices/limitsSlice";
import userPreferencesReducer from "../features/news/slices/userPreferencesSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    auth: authReducer,
    agents: agentsReducer,
    subscription: subscriptionReducer,
    limits: limitsReducer,
    userPreferences: userPreferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
