import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {},
  searchQuery: '',
  activeTab: 'overview',
};

const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetPageData: () => initialState,
  },
});

export const { setFilter, setSearchQuery, setActiveTab, resetPageData } = pageSlice.actions;
export default pageSlice.reducer;
