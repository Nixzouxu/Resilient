# Tahap 1: kompilasi TypeScript menjadi JavaScript biasa
FROM node:22-alpine AS build
WORKDIR /app
# package-lock sengaja tidak disalin: lockfile dibuat di Windows dan bisa
# kehilangan binary Linux. Install ulang di dalam image lebih aman.
COPY package.json ./
RUN npm install --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Tahap 2: image akhir kecil, hanya hasil kompilasi dan dependency produksi
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]