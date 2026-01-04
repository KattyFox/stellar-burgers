import React, { FC } from 'react';
import { NavLink } from 'react-router-dom'; // Добавить
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        {/* Конструктор */}
        <NavLink
          to='/'
          className={({ isActive }) =>
            `text text_type_main-default ml-2 mr-10 ${styles.link} ${
              isActive ? styles.link_active : ''
            }`
          }
          end
        >
          <BurgerIcon type='primary' />
          Конструктор
        </NavLink>

        {/* Лента заказов */}
        <NavLink
          to='/feed'
          className={({ isActive }) =>
            `text text_type_main-default ml-2 ${styles.link} ${
              isActive ? styles.link_active : ''
            }`
          }
        >
          <ListIcon type='primary' />
          Лента заказов
        </NavLink>
      </div>

      <div className={styles.logo}>
        <Logo className='' />
      </div>

      {/* Личный кабинет */}
      <div className={styles.link_position_last}>
        <NavLink
          to='/profile'
          className={({ isActive }) =>
            `text text_type_main-default ml-2 ${styles.link} ${
              isActive ? styles.link_active : ''
            }`
          }
        >
          <ProfileIcon type='primary' />
          {userName || 'Личный кабинет'}
        </NavLink>
      </div>
    </nav>
  </header>
);
