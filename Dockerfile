# Use official Node.js LTS image
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY products.json ./
EXPOSE 4000
# Install dependencies and build app
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Use production start script
CMD ["npm", "run", "start"]