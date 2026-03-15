// src/services/__tests__/rootReducer.test.ts
import store from '../store';

describe('rootReducer', () => {
  test('начальное состояние хранилища корректно', () => {
    const state = store.getState();

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
