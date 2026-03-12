FROM node:18-bullseye-slim

WORKDIR /app

COPY package.json ./

RUN npm install --include=dev --no-audit --no-fund
RUN npm install --no-audit --no-fund --no-save @tailwindcss/oxide-linux-x64-gnu

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
