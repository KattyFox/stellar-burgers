import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Добавить useNavigate
import { ProfileMenuUI } from '@ui';
import { useDispatch } from '../../services/store'; // Добавить
import { logoutUser } from '../../services/slices/userSlice'; // Добавить

export const ProfileMenu: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate(); // Добавить
  const dispatch = useDispatch(); // Добавить

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login'); // Перенаправляем на страницу логина
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
