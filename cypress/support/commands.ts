/// <reference types="cypress" />

// Расширяем типы Cypress для наших кастомных команд
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
  }
}

// Команда для установки моковых токенов
Cypress.Commands.add('setMockTokens', () => {
  cy.window().then((win) => {
    // Устанавливаем в localStorage
    win.localStorage.setItem('refreshToken', 'mock-refresh-token');
    win.localStorage.setItem('accessToken', 'mock-access-token');

    // Устанавливаем в cookie
    cy.setCookie('accessToken', 'mock-access-token');
  });

  cy.log('✅ Моковые токены установлены');
});

// Команда для очистки моковых токенов
Cypress.Commands.add('clearMockTokens', () => {
  cy.window().then((win) => {
    // Очищаем localStorage
    win.localStorage.removeItem('refreshToken');
    win.localStorage.removeItem('accessToken');

    // Очищаем cookie
    cy.clearCookie('accessToken');
  });

  cy.log('✅ Моковые токены очищены');
});
