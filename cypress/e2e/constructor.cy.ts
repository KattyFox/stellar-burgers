// cypress/e2e/constructor.cy.ts

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
      // Находим булку по тексту и кликаем на кнопку "Добавить"
      cy.contains('Краторная булка N-200i')
        .parents('[class*="container"]') // используем класс container
        .within(() => {
          cy.get('button').contains('Добавить').click(); // находим кнопку
        });

      // Проверяем появление в конструкторе
      cy.contains('Краторная булка N-200i (верх)').should('exist');
      cy.contains('Краторная булка N-200i (низ)').should('exist');
    });

    it('должен добавить начинку в конструктор', () => {
      // Сначала добавляем булку
      cy.contains('Краторная булка N-200i')
        .parents('[class*="container"]')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      // Добавляем начинку
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('[class*="container"]')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      cy.contains('Биокотлета из марсианской Магнолии').should('exist');
    });
  });

  describe('Работа модального окна ингредиента', () => {
    it('должен открыть модальное окно ингредиента при клике на него', () => {
      // Кликаем на ссылку с классом article (название ингредиента)
      cy.contains('Краторная булка N-200i')
        .parents('[class*="article"]')
        .click();

      cy.contains('Детали ингредиента').should('exist');
      cy.contains('Краторная булка N-200i').should('exist');
    });

    it('должен закрыть модальное окно по клику на крестик', () => {
      cy.contains('Краторная булка N-200i')
        .parents('[class*="article"]')
        .click();
      cy.contains('Детали ингредиента').should('exist');

      // Находим кнопку закрытия в модальном окне
      cy.get('[class*="modal"]').find('button').click();
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('должен закрыть модальное окно по клику на оверлей', () => {
      cy.contains('Краторная булка N-200i')
        .parents('[class*="article"]')
        .click();
      cy.contains('Детали ингредиента').should('exist');

      // Кликаем на оверлей
      cy.get('[class*="overlay"]').click({ force: true });
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('должен отображать данные именно того ингредиента, по которому кликнули', () => {
      // Кликаем на булку
      cy.contains('Краторная булка N-200i')
        .parents('[class*="article"]')
        .click();
      cy.contains('Краторная булка N-200i').should('exist');
      cy.contains('Биокотлета из марсианской Магнолии').should('not.exist');

      cy.get('[class*="modal"]').find('button').click();

      // Кликаем на начинку
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('[class*="article"]')
        .click();
      cy.contains('Биокотлета из марсианской Магнолии').should('exist');
      cy.contains('Краторная булка N-200i').should('not.exist');
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
        .parents('[class*="container"]')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      // Добавляем начинку
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('[class*="container"]')
        .within(() => {
          cy.get('button').contains('Добавить').click();
        });

      // Оформляем заказ
      cy.contains('Оформить заказ').click();
      cy.wait('@createOrder');

      // Проверяем модальное окно заказа
      cy.contains('идентификатор заказа').should('exist');
      cy.contains('12345').should('exist');

      // Закрываем
      cy.get('[class*="modal"]').find('button').click();
      cy.contains('идентификатор заказа').should('not.exist');

      // Проверяем, что конструктор пуст
      cy.contains('Выберите булки').should('exist');
      cy.contains('Выберите начинку').should('exist');
    });
  });
});
