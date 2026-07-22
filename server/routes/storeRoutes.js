import express from 'express';
import * as storeController from '../controllers/storeController.js';

const router = express.Router();

// Single-store mode — no slug needed
router.get('/', storeController.getStore);
router.get('/products', storeController.listProducts);
router.get('/products/:id', storeController.getProduct);
router.get('/categories', storeController.listCategories);
router.post('/orders', storeController.createOrder);

export default router;

