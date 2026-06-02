# ─── Development stage ───────────────────────────────────────────────────────
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:8081
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Production stage ────────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "run", "start"]
