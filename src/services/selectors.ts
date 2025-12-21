import { RootState } from './store';

// state.ingredients — это имя слайса, .ingredients — массив внутри него
export const getIngredientsSelector = (state: RootState) =>
  state.ingredients?.ingredients || [];

export const getIngredientsLoadingSelector = (state: RootState) =>
  state.ingredients?.loading;
