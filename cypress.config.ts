import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000',
    setupNodeEvents(on, config) {
      // Передаем переменные окружения в Cypress
      config.env = {
        ...process.env,
        ...config.env
      };
      return config;
    }
  }
});
