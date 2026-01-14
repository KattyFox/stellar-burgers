import { FC, useMemo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useSelector } from '../../services/store';
import { getOrderByNumberApi } from '@api';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [fetchedOrder, setFetchedOrder] = useState<TOrder | null>(null);

  const ingredients: TIngredient[] = useSelector(
    (state) => state.ingredients.ingredients
  );
  const { orders: feedOrders } = useSelector((state) => state.feed);
  const { orders: userOrders } = useSelector((state) => state.userOrders);

  const allOrders = [...feedOrders, ...userOrders];
  const orderData = allOrders.find(
    (order) => order.number.toString() === number
  );

  useEffect(() => {
    const fetchOrderByNumber = async () => {
      if (!number || orderData || fetchedOrder || orderLoading) return;

      const orderNumber = parseInt(number, 10);
      if (isNaN(orderNumber)) {
        setOrderError('Некорректный номер заказа');
        return;
      }

      setOrderLoading(true);
      setOrderError(null);

      try {
        const response = await getOrderByNumberApi(orderNumber);
        if (response.success && response.orders.length > 0) {
          setFetchedOrder(response.orders[0]);
        } else {
          setOrderError('Заказ не найден');
        }
      } catch (error) {
        console.error('Ошибка при получении заказа:', error);
        setOrderError('Не удалось загрузить информацию о заказе');
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderByNumber();
  }, [number, orderData, fetchedOrder, orderLoading]);

  const currentOrder = orderData || fetchedOrder;

  // useMemo вызывов всегда, независимо от условий
  const orderInfo = useMemo(() => {
    if (!currentOrder || !ingredients.length) return null;

    const date = new Date(currentOrder.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...currentOrder,
      ingredientsInfo,
      date,
      total
    };
  }, [currentOrder, ingredients]); // useMemo всегда вызывается с одинаковым количеством зависимостей

  if (orderLoading) {
    return <Preloader />;
  }

  if (!currentOrder) {
    if (orderError) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p className='text text_type_main-medium'>{orderError}</p>
        </div>
      );
    }
    return <Preloader />;
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
