import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useSelector, useDispatch } from '../../services/store';
import { useNavigate } from 'react-router-dom';
// Импортируем экшены из слайсов
import { clearConstructor } from '../../services/slices/constructorSlice';
import { orderBurger, clearOrder } from '../../services/slices/orderSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Берем данные из стора (используем имена, которые дали в combineReducers)
  const constructorItems = useSelector((state) => state.burgerConstructor);
  const { orderRequest, orderData } = useSelector((state) => state.order);
  const user = useSelector((state) => state.user.data);

  // Обработчик клика по кнопке "Оформить заказ"
  const onOrderClick = () => {
    // Если булки нет или заказ уже в процессе — ничего не делаем
    if (!constructorItems.bun || orderRequest) return;

    // Если пользователь не авторизован — отправляем на страницу логина
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

  //Обработчик закрытия модального окна заказа
  const closeOrderModal = () => {
    dispatch(clearOrder()); // Очищаем данные заказа
    dispatch(clearConstructor()); // Очищаем конструктор бургера
  };

  //Подсчет итоговой стоимости (используем useMemo для оптимизации)
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
      // Мы модифицируем объект перед передачей в UI
      constructorItems={{
        ...constructorItems,
        bun: constructorItems.bun
          ? { ...constructorItems.bun, on: true } // Если булка есть, добавляем ей on: true
          : ({ on: false } as any) // Если булки нет, передаем объект с on: false
      }}
      orderModalData={orderData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
