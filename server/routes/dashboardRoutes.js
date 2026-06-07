import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/store', dashboardController.getDashboardStore);
router.put('/store', dashboardController.updateDashboardStore);
router.post('/store/init', dashboardController.initDashboardStore);

router.get('/products', dashboardController.listDashboardProducts);
router.post('/products', dashboardController.createDashboardProduct);
router.put('/products/:id', dashboardController.updateDashboardProduct);
router.delete('/products/:id', dashboardController.deleteDashboardProduct);

router.get('/categories', dashboardController.listDashboardCategories);
router.post('/categories', dashboardController.createDashboardCategory);
router.delete('/categories/:id', dashboardController.deleteDashboardCategory);

router.get('/orders', dashboardController.listDashboardOrders);
router.get('/orders/:id', dashboardController.getDashboardOrder);
router.put('/orders/:id', dashboardController.updateDashboardOrderStatus);

router.get('/stats', dashboardController.getDashboardStats);

export default router;
