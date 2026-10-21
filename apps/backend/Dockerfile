FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh source code backend
COPY . .

# Ekspos port yang digunakan aplikasi
EXPOSE 5000

# Jalankan aplikasi menggunakan script "start"
CMD ["npm", "start"]