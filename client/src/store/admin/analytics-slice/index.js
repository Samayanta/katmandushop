import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  analyticsData: null,
  error: null,
};

export const getAnalytics = createAsyncThunk(
  "analytics/getAnalytics",
  async ({ startDate, endDate }) => {
    const response = await axios.get(
      `http://localhost:5001/api/admin/analytics`,
      {
        params: { startDate, endDate }
      }
    );
    return response.data;
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetAnalytics: (state) => {
      state.analyticsData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyticsData = action.payload.data;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
