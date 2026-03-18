/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Устанавливает моковые токены в localStorage и cookie
     * @example cy.setMockTokens()
     */
    setMockTokens(): Chainable<void>;

    /**
     * Очищает моковые токены из localStorage и cookie
     * @example cy.clearMockTokens()
     */
    clearMockTokens(): Chainable<void>;

    /**
     * Добавляет ингредиент в конструктор по индексу
     * @param index индекс ингредиента (0 - булка, 1 - начинка)
     * @example cy.addIngredient(0)
     */
    addIngredient(index: number): Chainable<void>;
  }
}

Cypress.Commands.add('setMockTokens', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('refreshToken', 'testRefreshToken');
    win.localStorage.setItem('accessToken', 'testAccessToken');
    cy.setCookie('accessToken', 'testAccessToken');
  });
  cy.log('✅ Моковые токены установлены');
});

Cypress.Commands.add('clearMockTokens', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('refreshToken');
    win.localStorage.removeItem('accessToken');
    cy.clearCookie('accessToken');
  });
  cy.log('✅ Моковые токены очищены');
});

Cypress.Commands.add('addIngredient', (index: number) => {
  cy.get(`[data-cy=ingredient_${index}]`).find('button').click();
});
