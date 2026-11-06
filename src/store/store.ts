import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,   // put the "auth" drawer in the toy box
    },
});

// These two lines are for TypeScript, so it knows what's inside the box.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;