import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. What toys can live in this drawer?
interface AuthState {
  token: string | null;     // the secret key that proves you logged in
  username: string | null;  // your name
}

// 2. What's in the drawer when the app first opens?
// We peek into the browser's memory so you stay logged in after refreshing.
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
};

// 3. Build the drawer and teach the helper what notes it understands
const authSlice = createSlice({
  name: 'auth',          // the label on the drawer
  initialState,
  reducers: {
    // Note #1: "I logged in! Please store these."
    loginSuccess(state, action: PayloadAction<{ token: string; username: string }>) {
      state.token = action.payload.token;
      state.username = action.payload.username;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('username', action.payload.username);
    },
    // Note #2: "I left. Please empty the drawer."
    logout(state) {
      state.token = null;
      state.username = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    },
  },
});

// 4. Export the notes (actions) so rooms can hand them in
export const { loginSuccess, logout } = authSlice.actions;
// 5. Export the helper (reducer) so the toy box can use it
export default authSlice.reducer;