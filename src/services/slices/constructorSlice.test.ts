// src/services/slices/__tests__/constructorSlice.test.ts
import constructorSlice, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  initialState
} from '../slices/constructorSlice';
import { TIngredient, TConstructorIngredient } from '@utils-types';

// Мокаем uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}));

describe('constructorSlice', () => {
  const mockBun: TIngredient = {
    _id: 'bun-1',
    name: 'Краторная булка',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: '',
    image_large: '',
    image_mobile: ''
  };

  const mockMain: TIngredient = {
    _id: 'main-1',
    name: 'Биокотлета',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: '',
    image_large: '',
    image_mobile: ''
  };

  const mockSauce: TIngredient = {
    _id: 'sauce-1',
    name: 'Соус',
    type: 'sauce',
    proteins: 10,
    fat: 20,
    carbohydrates: 30,
    calories: 100,
    price: 50,
    image: '',
    image_large: '',
    image_mobile: ''
  };

  // ✅ Тест на добавление булки
  test('добавление булки', () => {
    const action = addIngredient(mockBun);
    const newState = constructorSlice.reducer(initialState, action);

    expect(newState.bun).toEqual({
      ...mockBun,
      id: 'test-uuid-123'
    });
    expect(newState.ingredients).toHaveLength(0);
  });

  // ✅ Тест на добавление начинки
  test('добавление начинки', () => {
    const action = addIngredient(mockMain);
    const newState = constructorSlice.reducer(initialState, action);

    expect(newState.bun).toBeNull();
    expect(newState.ingredients).toHaveLength(1);
    expect(newState.ingredients[0]).toEqual({
      ...mockMain,
      id: 'test-uuid-123'
    });
  });

  // ✅ Тест на добавление соуса
  test('добавление соуса', () => {
    const action = addIngredient(mockSauce);
    const newState = constructorSlice.reducer(initialState, action);

    expect(newState.ingredients).toHaveLength(1);
    expect(newState.ingredients[0]).toEqual({
      ...mockSauce,
      id: 'test-uuid-123'
    });
  });

  // ✅ Тест на удаление ингредиента
  test('удаление ингредиента', () => {
    const ingredientWithId: TConstructorIngredient = {
      ...mockMain,
      id: 'test-id-1'
    };
    const stateWithIngredient = {
      ...initialState,
      ingredients: [ingredientWithId]
    };

    const action = removeIngredient('test-id-1');
    const newState = constructorSlice.reducer(stateWithIngredient, action);

    expect(newState.ingredients).toHaveLength(0);
  });

  // ✅ Тест на изменение порядка (перемещение вверх)
  test('изменение порядка ингредиентов (перемещение вверх)', () => {
    const ing1: TConstructorIngredient = { ...mockMain, id: '1' };
    const ing2: TConstructorIngredient = { ...mockMain, id: '2' };
    const ing3: TConstructorIngredient = { ...mockMain, id: '3' };

    const stateWithIngredients = {
      ...initialState,
      ingredients: [ing1, ing2, ing3]
    };

    const action = moveIngredient({ from: 2, to: 0 });
    const newState = constructorSlice.reducer(stateWithIngredients, action);

    expect(newState.ingredients).toEqual([ing3, ing1, ing2]);
  });

  // ✅ Тест на изменение порядка (перемещение вниз)
  test('изменение порядка ингредиентов (перемещение вниз)', () => {
    const ing1: TConstructorIngredient = { ...mockMain, id: '1' };
    const ing2: TConstructorIngredient = { ...mockMain, id: '2' };
    const ing3: TConstructorIngredient = { ...mockMain, id: '3' };

    const stateWithIngredients = {
      ...initialState,
      ingredients: [ing1, ing2, ing3]
    };

    const action = moveIngredient({ from: 0, to: 2 });
    const newState = constructorSlice.reducer(stateWithIngredients, action);

    expect(newState.ingredients).toEqual([ing2, ing3, ing1]);
  });
});
