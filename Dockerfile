# Dockerfile
FROM node:18

# Робоча директорія
WORKDIR /app

# Копіюємо package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності та TypeScript глобально
RUN npm install
RUN npm install -g typescript

# Копіюємо всі файли проєкту
COPY . .

# Компіляція TypeScript з src/server.ts в dist/
RUN npm run build

# Запуск сервера
CMD ["node", "dist/server.js"]
