# Use official Node.js LTS image
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY products.json ./
EXPOSE 4000
# Install dependencies
RUN npm install --legacy-peer-deps
COPY . .

# Use development start script for autorefresh
CMD ["npm", "run", "dev"]