import { Router } from 'express';
import { calculatePayouts, getPayoutPeriods } from '../controllers/payoutController.js';

const router = Router();

router.get('/periods', getPayoutPeriods);
router.post('/calculate', calculatePayouts);

export default router;
