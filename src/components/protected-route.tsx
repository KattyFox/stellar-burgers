import React from 'react';
import { useSelector } from '../services/store';
import { Navigate, useLocation } from 'react-router-dom';
import { Preloader } from '../components/ui/preloader';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children
}: ProtectedRouteProps) => {
  // Проверяем данные пользователя в сторе
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const user = useSelector((state) => state.user.data);
  const location = useLocation();

  // Если проверка авторизации еще идет, показываем лоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Если это роут для гостей (Login/Register), а юзер уже вошел — отправляем на главную
  if (onlyUnAuth && user) {
    const { from } = location.state || { from: { pathname: '/' } };
    return <Navigate to={from} />;
  }

  // Если роут только для авторизованных, а пользователь не авторизован
  if (!onlyUnAuth && !user) {
    // Сохраняем текущий путь для возврата после авторизации
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
