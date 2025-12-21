import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api'; // Импортируем готовую функцию запроса
import { TIngredient } from '@utils-types';

// 1. Создаем "Thunk" (санка). Это асинхронный экшен.
// Он сам сделает запрос к серверу и передаст результат в редюсер.
export const fetchIngredients = createAsyncThunk(
  'ingredients/getAll', // Имя экшена (произвольное)
  async () => {
    const data = await getIngredientsApi();
    return data; // Это вернется в action.payload
  }
);

interface IIngredientsState {
  ingredients: TIngredient[];
  loading: boolean;
  error: string | null;
}

const initialState: IIngredientsState = {
  ingredients: [],
  loading: false,
  error: null
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {}, // Здесь могли бы быть обычные функции (например, очистка)
  extraReducers: (builder) => {
    builder
      // Когда запрос улетел, но ответа еще нет
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Когда данные успешно пришли
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload;
      })
      // Если сервер ответил ошибкой
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки';
      });
  }
});

export default ingredientsSlice.reducer;
