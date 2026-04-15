FROM node:18-bullseye-slim

WORKDIR /app

ARG API_PROXY_TARGET=http://localhost:4001
ENV API_PROXY_TARGET=${API_PROXY_TARGET}

COPY package.json ./

RUN npm install --include=dev --no-audit --no-fund
RUN npm install --no-audit --no-fund --no-save @tailwindcss/oxide-linux-x64-gnu

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
