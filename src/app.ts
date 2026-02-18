import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'https://immunotec-ro.onrender.com',
  'https://immunotec.onrender.com'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Explicitly set Access-Control-Allow-Origin for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

// Remove a product by index
app.delete('/products/:index', authenticate, (req: Request, res: Response) => {
  const productsPath = path.join(process.cwd(), 'products.json');
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx)) {
    return res.status(400).json({ error: 'Invalid index.' });
  }
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products:', err);
      return res.status(500).json({ error: 'Failed to read products.' });
    }
    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid products data.' });
    }
    if (idx < 0 || idx >= products.length) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    products.splice(idx, 1);
    fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8', err2 => {
      if (err2) {
        console.error('Error writing products:', err2);
        return res.status(500).json({ error: 'Failed to remove product.' });
      }
      res.json({ message: 'Product removed successfully.' });
    });
  });
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
const PORT = 4000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple token-based authentication middleware
const AUTH_TOKEN = process.env.PRODUCTS_AUTH_TOKEN || 'changeme';
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Allow updating products.json via POST
app.post('/products', authenticate, (req: Request, res: Response) => {
  const productsPath = path.join(process.cwd(), 'products.json');
  const newProducts = req.body;
  if (!Array.isArray(newProducts)) {
    return res.status(400).json({ error: 'Request body must be an array of products.' });
  }
  fs.writeFile(productsPath, JSON.stringify(newProducts, null, 2), 'utf8', err => {
    if (err) {
      console.error('Error writing products:', err);
      return res.status(500).json({ error: 'Failed to update products.' });
    }
    res.json({ message: 'Products updated successfully.' });
  });
});

// Add a new product to products.json
app.post('/products/add', authenticate, (req: Request, res: Response) => {
  const productsPath = path.join(process.cwd(), 'products.json');
  const newProduct = req.body;
  if (!newProduct || typeof newProduct !== 'object') {
    return res.status(400).json({ error: 'Request body must be a product object.' });
  }
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products:', err);
      return res.status(500).json({ error: 'Failed to read products.' });
    }
    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid products data.' });
    }
    products.push(newProduct);
    fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8', err2 => {
      if (err2) {
        console.error('Error writing products:', err2);
        return res.status(500).json({ error: 'Failed to add product.' });
      }
      res.json({ message: 'Product added successfully.' });
    });
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const description = req.body.description;
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  res.status(200).json({
    message: 'File uploaded successfully.',
    file: req.file,
    description
  });
});


app.get('/products', (req, res) => {
  const productsPath = path.join(process.cwd(), 'products.json');
  console.log('Attempting to load products from:', productsPath);
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error loading products:', err);
      return res.status(500).json({ error: 'Failed to load products.' });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
