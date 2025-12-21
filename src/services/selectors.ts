import { RootState } from './store';

// Получаем список всех ингредиентов
export const getIngredientsSelector = (state: RootState) =>
  state.ingredients.ingredients;

// Получаем статус загрузки (чтобы показать спиннер)
export const getIngredientsLoadingSelector = (state: RootState) =>
  state.ingredients.loading;
