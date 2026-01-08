import { RootState } from './store';

export const getIngredientsSelector = (state: RootState) =>
  state.ingredients?.ingredients || [];

export const getIngredientsLoadingSelector = (state: RootState) =>
  state.ingredients?.loading;

export const getFeedSelector = (state: RootState) => state.feed;

export const getUserOrdersSelector = (state: RootState) => state.userOrders;

export const getUserSelector = (state: RootState) => state.user;
