import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storesRouter from "./stores";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storesRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);

export default router;
