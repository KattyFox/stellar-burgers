import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';

// Асинхронный запрос на сервер
export const orderBurger = createAsyncThunk(
  'order/sendOrder',
  async (data: string[]) => {
    const res = await orderBurgerApi(data);
    return res; // Возвращаем весь ответ, там будет и success, и order
  }
);

interface IOrderState {
  orderData: TOrder | null;
  orderRequest: boolean; // Статус запроса (лоадер)
  error: string | null;
}

const initialState: IOrderState = {
  orderData: null,
  orderRequest: false,
  error: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Метод для очистки заказа (вызывается при закрытии модалки)
    clearOrder: (state) => {
      state.orderData = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true; // Начали запрос — включаем лоадер
        state.error = null;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false; // Запрос выполнен
        state.orderData = action.payload.order; // Сохраняем данные заказа
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.orderRequest = false; // Запрос упал
        state.error = action.error.message || 'Ошибка при оформлении заказа';
      });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice;
