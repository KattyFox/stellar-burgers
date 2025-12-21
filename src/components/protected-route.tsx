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
  // Проверяем данные пользователя в сторе (убедись, что в userSlice есть эти поля)
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

  // Если это роут для своих (Profile), а юзера нет — отправляем на логин
  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} />;
  }

  return children;
};
