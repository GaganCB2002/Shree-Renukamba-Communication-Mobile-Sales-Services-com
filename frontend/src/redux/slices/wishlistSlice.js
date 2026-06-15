import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: localStorage.getItem('wishlistItems')
    ? JSON.parse(localStorage.getItem('wishlistItems'))
    : [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const item = action.payload;
      const exists = state.items.some((x) => x._id === item._id || x.id === item.id);
      if (exists) {
        state.items = state.items.filter((x) => x._id !== item._id && x.id !== item.id);
      } else {
        state.items.push(item);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlistItems');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
