import { createSlice } from '@reduxjs/toolkit';

function loadCartItems() {
  try {
    const data = localStorage.getItem('cartItems');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

const initialState = {
  cartItems: loadCartItems(),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id || x.id === item.id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          (x._id === item._id || x.id === item.id) ? { ...x, quantity: x.quantity + 1 } : x
        );
      } else {
        state.cartItems.push({ ...item, quantity: 1 });
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x._id !== action.payload && x.id !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((x) => x._id === id || x.id === id);
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
