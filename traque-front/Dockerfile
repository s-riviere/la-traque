FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["npm", "run", "dev"]