import express from 'express';
import * as storeController from '../controllers/storeController.js';

const router = express.Router();

router.get('/:slug', storeController.getStore);
router.get('/:slug/products', storeController.listProducts);
router.get('/:slug/products/:id', storeController.getProduct);
router.get('/:slug/categories', storeController.listCategories);
router.post('/:slug/orders', storeController.createOrder);

export default router;
