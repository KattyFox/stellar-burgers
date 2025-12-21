import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import { IngredientDetails, OrderInfo, Modal } from '@components';
import './../../index.css';
import styles from './app.module.css';
import { AppHeader } from '@components';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { FC } from 'react';
import { ROUTES } from '../../routes/routes'; // Импортируем наши пути
import { useEffect } from 'react';
import { useDispatch } from '../../services/store'; // наш кастомный хук
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

const App: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Добавили dispatch
  // background — это сохраненное состояние "предыдущей страницы"
  // Если оно есть, значит мы открыли модалку поверх основной страницы
  const background = location.state?.background;

  // Добавили useEffect для загрузки ингредиентов при монтировании
  useEffect(() => {
    // Как только приложение загрузилось, идем за ингредиентами
    dispatch(fetchIngredients());
  }, [dispatch]);

  const handleModalClose = () => {
    // Возвращаемся на один шаг назад в истории браузера
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      {/* Основные маршруты: если есть background, показываем "подложку" (фон) */}
      <Routes location={background || location}>
        <Route path={ROUTES.HOME} element={<ConstructorPage />} />
        <Route path={ROUTES.FEED_ORDER} element={<Feed />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.PROFILE_ORDER} element={<Profile />} />
        <Route path={ROUTES.PROFILE_ORDER} element={<ProfileOrders />} />
        {/* Эти маршруты сработают как отдельные страницы, если зайти по прямой ссылке */}
        <Route path={ROUTES.INGREDIENTS} element={<IngredientDetails />} />
        <Route path={ROUTES.FEED_ORDER} element={<OrderInfo />} />
        <Route path={ROUTES.PROFILE_ORDER} element={<OrderInfo />} />
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {/* Модальные окна: отрисовываются только если в state есть background */}
      {background && (
        <Routes>
          <Route
            path={ROUTES.INGREDIENTS}
            element={
              <Modal title='Детали ингредиента' onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path={ROUTES.FEED_ORDER}
            element={
              <Modal title='Инфо заказа' onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path={ROUTES.PROFILE_ORDER}
            element={
              <Modal title='Инфо заказа' onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
