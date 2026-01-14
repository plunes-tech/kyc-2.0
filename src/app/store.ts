import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookingReducer from "../features/booking/bookingSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import hospitalReducer from "../features/hospital/hospitalSlice";
import uploadReducer from "../features/uploads/uploadSlice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    dashboard: dashboardReducer,
    hospital: hospitalReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (they might contain non-serializable values)
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;