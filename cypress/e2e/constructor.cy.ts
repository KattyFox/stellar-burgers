// cypress/e2e/constructor.cy.ts

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
    cy.intercept('GET', '**/api/ingredients').as('getIngredients');

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
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('GET', '**/api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    cy.intercept('POST', '**/api/orders', {
      fixture: 'order.json'
    }).as('createOrder');

    cy.visit('/');
    cy.wait('@getIngredients');
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('должен добавить булку в конструктор', () => {
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      cy.contains('Краторная булка N-200i (верх)').should('exist');
      cy.contains('Краторная булка N-200i (низ)').should('exist');
    });

    it('должен добавить начинку в конструктор', () => {
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      cy.contains('Биокотлета из марсианской Магнолии')
        .closest('li')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      cy.contains('Биокотлета из марсианской Магнолии').should('exist');
    });
  });

  describe('Работа модального окна ингредиента', () => {
    it('должен открыть модальное окно ингредиента при клике на него', () => {
      cy.contains('Краторная булка N-200i').closest('a').click();
      cy.contains('Детали ингредиента').should('exist');
      cy.contains('Краторная булка N-200i').should('exist');
    });

    it('должен закрыть модальное окно по клику на крестик', () => {
      cy.contains('Краторная булка N-200i').closest('a').click();
      cy.contains('Детали ингредиента').should('exist');

      // Кликаем на крестик с force: true, так как он перекрыт оверлеем
      // 👇 ДОБАВЬ ЭТО - закрываем модалку перед выходом
      cy.get('[class*="modal"]').find('button').click({ force: true });
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('должен закрыть модальное окно по клику на оверлей', () => {
      cy.contains('Краторная булка N-200i').closest('a').click();
      cy.contains('Детали ингредиента').should('exist');

      // Кликаем на оверлей (он может иметь другой класс)
      cy.get('body').click(100, 100); // Клик в угол экрана
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('должен отображать данные именно того ингредиента, по которому кликнули', () => {
      // Кликаем на булку
      cy.contains('Краторная булка N-200i').closest('a').click();
      cy.contains('Детали ингредиента').should('exist');
      cy.contains('Краторная булка N-200i').should('exist');

      // Проверяем, что начинки нет в модалке
      cy.get('[class*="modal"]').within(() => {
        cy.contains('Биокотлета из марсианской Магнолии').should('not.exist');
      });

      // Закрываем
      cy.get('[class*="modal"]').find('button').click({ force: true });

      // Кликаем на начинку
      cy.contains('Биокотлета из марсианской Магнолии').closest('a').click();
      cy.contains('Детали ингредиента').should('exist');
      cy.contains('Биокотлета из марсианской Магнолии').should('exist');

      // Проверяем, что булки нет в модалке
      cy.get('[class*="modal"]').within(() => {
        cy.contains('Краторная булка N-200i').should('not.exist');
      });
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      cy.setMockTokens();
    });

    afterEach(() => {
      cy.clearMockTokens();
    });

    it('должен создать заказ и очистить конструктор', () => {
      // Добавляем булку
      cy.contains('Краторная булка N-200i')
        .closest('li')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      // Добавляем начинку
      cy.contains('Биокотлета из марсианской Магнолии')
        .closest('li')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      // Оформляем заказ
      cy.contains('Оформить заказ').click();

      // Ждем запрос
      cy.wait('@createOrder', { timeout: 10000 });

      // Проверяем модальное окно заказа
      cy.get('[class*="modal"]').within(() => {
        cy.contains('идентификатор заказа').should('exist');
        cy.contains('12345').should('exist');
      });

      // Закрываем
      cy.get('[class*="modal"]').find('button').click({ force: true });
      cy.get('[class*="modal"]').should('not.exist');

      // Проверяем, что конструктор пуст
      cy.contains('Выберите булки').should('exist');
      cy.contains('Выберите начинку').should('exist');
    });
  });
});
