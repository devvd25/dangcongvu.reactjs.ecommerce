import { createStore } from "redux";

const initialState = {
  cartItemCount: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_CART_ITEM_COUNT":
      return {
        ...state,
        cartItemCount: action.payload,
      };
    default:
      return state;
  }
};

const store = createStore(reducer);
export default store;
