// Импортируем кастомные команды
import './commands';

// Отключаем обработку непойманных исключений
Cypress.on('uncaught:exception', () => false);
