import { FC } from 'react';
import { useParams } from 'react-router-dom'; // ← Добавить
import { useSelector } from '../../services/store'; // ← Добавить
import { RootState } from '../../services/store'; // ← Добавить
import { TIngredient } from '@utils-types'; // ← Добавить для типизации
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();

  // Получаем данные из стора
  const { ingredients, loading } = useSelector((state: RootState) => ({
    ingredients: state.ingredients.ingredients,
    loading: state.ingredients.loading
  }));

  // Ищем нужный ингредиент по id из URL
  const ingredientData = ingredients.find((item) => item._id === id);

  // Пока идет загрузка
  if (loading) {
    return <Preloader />;
  }

  // Если ингредиент не найден после загрузки
  if (!ingredientData) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p className='text text_type_main-medium'>Ингредиент не найден</p>
      </div>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
