import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useSelector, useDispatch } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { clearConstructor } from '../../services/slices/constructorSlice';
import { orderBurger, clearOrder } from '../../services/slices/orderSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Данные из стора (используем имена, которые в combineReducers)
  const constructorItems = useSelector((state) => state.burgerConstructor);
  const { orderRequest, orderData } = useSelector((state) => state.order);
  const user = useSelector((state) => state.user.data);

  const onOrderClick = () => {
    // Булки нет или заказ в процессе — ничего не делаем
    if (!constructorItems.bun || orderRequest) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Собираем массив ID всех ингредиентов (булка + начинки + булка)
    const dataToOrder = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map(
        (item: TConstructorIngredient) => item._id
      ),
      constructorItems.bun._id
    ];

    // Отправляем запрос на сервер через Thunk
    dispatch(orderBurger(dataToOrder));
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(clearConstructor());
  };

  //Подсчет итоговой стоимости
  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      // Модифицируем объект перед передачей в UI
      constructorItems={{
        ...constructorItems,
        bun: constructorItems.bun
          ? { ...constructorItems.bun, on: true } // Булка есть
          : ({ on: false } as any) // Булки нет
      }}
      orderModalData={orderData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
