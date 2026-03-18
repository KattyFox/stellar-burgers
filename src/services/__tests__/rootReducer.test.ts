// src/services/__tests__/rootReducer.test.ts
import { UnknownAction } from '@reduxjs/toolkit';
import ingredientsSlice from '../slices/ingredientsSlice';
import constructorSlice from '../slices/constructorSlice';
import userSlice from '../slices/userSlice';
import orderSlice from '../slices/orderSlice';
import feedSlice from '../slices/feedSlice';
import userOrdersSlice from '../slices/userOrdersSlice';

describe('rootReducer', () => {
  test('вызов с undefined и неизвестным экшеном возвращает начальное состояние', () => {
    const unknownAction: UnknownAction = { type: 'UNKNOWN_ACTION' };

    // Используем .reducer у каждого слайса
    const state = {
      ingredients: ingredientsSlice.reducer(undefined, unknownAction),
      burgerConstructor: constructorSlice.reducer(undefined, unknownAction),
      user: userSlice.reducer(undefined, unknownAction),
      order: orderSlice.reducer(undefined, unknownAction),
      feed: feedSlice.reducer(undefined, unknownAction),
      userOrders: userOrdersSlice.reducer(undefined, unknownAction)
    };

    expect(state).toEqual({
      ingredients: {
        ingredients: [],
        loading: false,
        error: null
      },
      burgerConstructor: {
        bun: null,
        ingredients: []
      },
      user: {
        data: null,
        isAuthChecked: false,
        error: null
      },
      order: {
        orderData: null,
        orderRequest: false,
        error: null
      },
      feed: {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null
      },
      userOrders: {
        orders: [],
        loading: false,
        error: null
      }
    });
  });
});
