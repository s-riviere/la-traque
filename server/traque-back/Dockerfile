# Étape commune
FROM node:22-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Étape développement
FROM base AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Étape builder
FROM base AS builder
ENV NODE_ENV=production
COPY . .
RUN npm run build && npm prune --omit=dev

# Étape production
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
