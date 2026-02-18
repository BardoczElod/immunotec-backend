# Immunotec Backend

This is the backend (API) service for Immunotec.

## Local Development

1. Install dependencies:
   npm install
2. Build TypeScript:
   npm run build
3. Start the server:
   npm start

## Docker

Build and run:
```
docker build -t immunotec-backend .
docker run -p 4000:4000 immunotec-backend
```

## Deployment (Render)
- Use the Dockerfile in this directory.
- Expose port 4000.
- Set environment variables as needed.

## API
- GET /products
- POST /products (auth required)
- POST /products/add (auth required)
- DELETE /products/:index (auth required)
- POST /upload
