// Импортируем кастомные команды
import './commands';

// Отключаем обработку непойманных исключений (чтобы тесты не падали из-за ошибок React)
Cypress.on('uncaught:exception', (err, runnable) => false);
