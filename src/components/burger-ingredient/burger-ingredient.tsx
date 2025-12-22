// src/components/burger-ingredient/burger-ingredient.tsx
import { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';
import { useDispatch } from '../../services/store'; // Добавить
import { addIngredient } from '../../services/slices/constructorSlice'; // Добавить

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();
    const dispatch = useDispatch(); // Добавить

    const handleAdd = () => {
      dispatch(addIngredient(ingredient)); // Реализовать
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        locationState={{ background: location }}
        handleAdd={handleAdd}
      />
    );
  }
);
