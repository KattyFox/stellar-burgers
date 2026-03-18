// cypress/e2e/constructor.cy.ts

// Константы для селекторов
const SELECTORS = {
  // Ингредиенты
  BUN_NAME: 'Краторная булка N-200i',
  MAIN_NAME: 'Биокотлета из марсианской Магнолии',

  // Кнопки и элементы интерфейса
  ADD_BUTTON: 'Добавить',
  CLOSE_BUTTON: '[data-cy="close-button"]',
  MODAL_OVERLAY: '[data-cy="modal-overlay"]',
  MODAL: '[data-cy="modal"]',

  // Тексты
  MODAL_TITLE: 'Детали ингредиента',
  ORDER_TITLE: 'идентификатор заказа',
  CONSTRUCTOR_BUN_TOP: 'Краторная булка N-200i (верх)',
  CONSTRUCTOR_BUN_BOTTOM: 'Краторная булка N-200i (низ)',
  EMPTY_BUN: 'Выберите булки',
  EMPTY_FILLING: 'Выберите начинку',

  // Кнопка заказа
  ORDER_BUTTON: 'Оформить заказ'
};

// Константы для тестовых данных
const TEST_DATA = {
  ORDER_NUMBER: '12345'
};

// Константы для API эндпоинтов
const API = {
  INGREDIENTS: '**/api/ingredients',
  USER: '**/api/auth/user',
  ORDERS: '**/api/orders'
};

describe('Проверка загрузки страницы', () => {
  it('страница должна загрузиться', () => {
    cy.visit('/');
    cy.wait(5000);

    cy.document().then((doc) => {
      const bodyText = doc.body.innerText;
      cy.log('Текст на странице:', bodyText.substring(0, 500));
    });

    cy.contains('Соберите бургер', { timeout: 10000 }).should('exist');
  });
});

describe('Отладка - проверка загрузки данных', () => {
  it('должен загрузить ингредиенты', () => {
    cy.intercept('GET', API.INGREDIENTS).as('getIngredients');

    cy.visit('/');

    cy.wait('@getIngredients').then((interception) => {
      console.log('Статус ответа:', interception.response?.statusCode);
      console.log('Данные:', interception.response?.body);
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.get('section').contains('Булки').should('exist');
  });
});

describe('Страница конструктора бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', API.INGREDIENTS, {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('GET', API.USER, {
      fixture: 'user.json'
    }).as('getUser');

    cy.intercept('POST', API.ORDERS, {
      fixture: 'order.json'
    }).as('createOrder');

    cy.visit('/');
    cy.wait('@getIngredients');
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('должен добавить булку в конструктор', () => {
      cy.contains(SELECTORS.BUN_NAME)
        .closest('li')
        .within(() => {
          cy.get('button').contains(SELECTORS.ADD_BUTTON).click();
        });

      cy.contains(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist');
      cy.contains(SELECTORS.CONSTRUCTOR_BUN_BOTTOM).should('exist');
    });

    it('должен добавить начинку в конструктор', () => {
      cy.contains(SELECTORS.BUN_NAME)
        .closest('li')
        .within(() => {
          cy.get('button').contains(SELECTORS.ADD_BUTTON).click();
        });

      cy.contains(SELECTORS.MAIN_NAME)
        .closest('li')
        .within(() => {
          cy.get('button').contains(SELECTORS.ADD_BUTTON).click();
        });

      cy.contains(SELECTORS.MAIN_NAME).should('exist');
    });
  });

  describe('Работа модального окна ингредиента', () => {
    it('должен открыть модальное окно ингредиента при клике на него', () => {
      cy.contains(SELECTORS.BUN_NAME).closest('a').click();
      cy.contains(SELECTORS.MODAL_TITLE).should('exist');
      cy.contains(SELECTORS.BUN_NAME).should('exist');
    });

    it('должен закрыть модальное окно по клику на крестик', () => {
      cy.contains(SELECTORS.BUN_NAME).closest('a').click();
      cy.contains(SELECTORS.MODAL_TITLE).should('exist');

      cy.get(SELECTORS.CLOSE_BUTTON).click();
      cy.contains(SELECTORS.MODAL_TITLE).should('not.exist');
    });

    it('должен закрыть модальное окно по клику на оверлей', () => {
      cy.contains(SELECTORS.BUN_NAME).closest('a').click();
      cy.contains(SELECTORS.MODAL_TITLE).should('exist');

      cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
      cy.contains(SELECTORS.MODAL_TITLE).should('not.exist');
    });

    it('должен отображать данные именно того ингредиента, по которому кликнули', () => {
      // Кликаем на булку
      cy.contains(SELECTORS.BUN_NAME).closest('a').click();
      cy.contains(SELECTORS.MODAL_TITLE).should('exist');
      cy.contains(SELECTORS.BUN_NAME).should('exist');

      // Проверяем, что начинки нет в модалке
      cy.get(SELECTORS.MODAL).within(() => {
        cy.contains(SELECTORS.MAIN_NAME).should('not.exist');
      });

      // Закрываем
      cy.get(SELECTORS.CLOSE_BUTTON).click();

      // Кликаем на начинку
      cy.contains(SELECTORS.MAIN_NAME).closest('a').click();
      cy.contains(SELECTORS.MODAL_TITLE).should('exist');
      cy.contains(SELECTORS.MAIN_NAME).should('exist');

      // Проверяем, что булки нет в модалке
      cy.get(SELECTORS.MODAL).within(() => {
        cy.contains(SELECTORS.BUN_NAME).should('not.exist');
      });
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      cy.intercept('GET', API.INGREDIENTS, {
        fixture: 'ingredients.json'
      }).as('getIngredients');

      cy.intercept('GET', API.USER, {
        fixture: 'user.json'
      }).as('getUser');

      cy.intercept('POST', API.ORDERS, {
        fixture: 'order.json'
      }).as('createOrder');

      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('refreshToken', 'testRefreshToken');
          win.localStorage.setItem('accessToken', 'testAccessToken');
          win.document.cookie = 'accessToken=testAccessToken';
        }
      });
      cy.wait('@getIngredients');
    });

    afterEach(() => {
      cy.clearMockTokens();
    });

    it('должен создать заказ и очистить конструктор', () => {
      // Добавляем булку
      cy.contains(SELECTORS.BUN_NAME)
        .closest('li')
        .within(() => {
          cy.get('button').contains(SELECTORS.ADD_BUTTON).click();
        });

      // Добавляем начинку
      cy.contains(SELECTORS.MAIN_NAME)
        .closest('li')
        .within(() => {
          cy.get('button').contains(SELECTORS.ADD_BUTTON).click();
        });

      // Оформляем заказ
      cy.contains(SELECTORS.ORDER_BUTTON).click();

      // Ждем запрос
      cy.wait('@createOrder', { timeout: 10000 });

      // Проверяем модальное окно заказа
      cy.contains(SELECTORS.ORDER_TITLE).should('be.visible');
      cy.contains(TEST_DATA.ORDER_NUMBER).should('be.visible');

      // Закрываем
      cy.get(SELECTORS.CLOSE_BUTTON).click();
      cy.get(SELECTORS.MODAL).should('not.exist');

      // Проверяем, что конструктор пуст
      cy.contains(SELECTORS.EMPTY_BUN).should('exist');
      cy.contains(SELECTORS.EMPTY_FILLING).should('exist');
    });
  });
});
