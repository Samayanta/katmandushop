import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  error: null
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    try {
      console.log("Fetching products with params:", { filterParams, sortParams });

      const query = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
      });

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/products/get?${query}`
      );

      if (!result?.data?.success) {
        throw new Error(result?.data?.message || "Failed to fetch products");
      }

      return result.data;
    } catch (error) {
      console.error("Product fetch error:", error);
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/products/get/${id}`
      );

      if (!result?.data?.success) {
        throw new Error(result?.data?.message || "Failed to fetch product details");
      }

      return result.data;
    } catch (error) {
      console.error("Product details fetch error:", error);
      return rejectWithValue(error.message || "Failed to fetch product details");
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch products";
        // Keep previous productList state instead of clearing it
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch product details";
        // Keep previous productDetails state instead of clearing it
      });
  },
});

export const { setProductDetails, clearError } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
