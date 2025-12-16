import React, { FC } from 'react';
import {
  Button,
  ConstructorElement,
  CurrencyIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from './burger-constructor.module.css';
import { BurgerConstructorUIProps } from './type';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorElement, Modal } from '@components';
import { Preloader, OrderDetailsUI } from '@ui';

export const BurgerConstructorUI: FC<BurgerConstructorUIProps> = ({
  constructorItems,
  orderRequest,
  price,
  orderModalData,
  onOrderClick,
  closeOrderModal
}) => {
  // Деструктурируем с значениями по умолчанию
  const { bun = null, ingredients = [] } = constructorItems || {};

  return (
    <section className={styles.burger_constructor}>
      {/* Верхняя булка */}
      <div className={`${styles.element} mb-4 mr-4`}>
        {bun ? (
          <ConstructorElement
            type='top'
            isLocked
            text={`${bun.name} (верх)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        ) : (
          <div className={`${styles.noBuns} ${styles.noBunsTop}`}>
            Выберите булки (верх)
          </div>
        )}
      </div>

      {/* Начинки */}
      <ul className={styles.elements}>
        {ingredients.length > 0 ? (
          ingredients.map((item: TConstructorIngredient, index: number) => (
            <BurgerConstructorElement
              ingredient={item}
              index={index}
              totalItems={ingredients.length}
              key={item.id}
            />
          ))
        ) : (
          <div className={styles.noBuns}>Выберите начинку</div>
        )}
      </ul>

      {/* Нижняя булка */}
      <div className={`${styles.element} mt-4 mr-4`}>
        {bun ? (
          <ConstructorElement
            type='bottom'
            isLocked
            text={`${bun.name} (низ)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        ) : (
          <div className={`${styles.noBuns} ${styles.noBunsBottom}`}>
            Выберите булки (низ)
          </div>
        )}
      </div>

      <div className={`${styles.total} mt-10 mr-4`}>
        <div className={`${styles.cost} mr-10`}>
          <p className={`text ${styles.text} mr-2`}>{price}</p>
          <CurrencyIcon type='primary' />
        </div>
        <Button
          htmlType='button'
          type='primary'
          size='large'
          onClick={onOrderClick}
        >
          Оформить заказ
        </Button>
      </div>

      {orderRequest && (
        <Modal onClose={closeOrderModal} title='Оформляем заказ...'>
          <Preloader />
        </Modal>
      )}

      {orderModalData && (
        <Modal
          onClose={closeOrderModal}
          title={orderRequest ? 'Оформляем заказ...' : ''}
        >
          <OrderDetailsUI orderNumber={orderModalData.number} />
        </Modal>
      )}
    </section>
  );
};
