import { Router } from 'express';
import {
  getRoyaltyRecords,
  getRoyaltyEarnings,
  addRoyalty
} from '../controllers/royaltyController.js';

const router = Router();

router.get('/', getRoyaltyRecords);
router.get('/earnings', getRoyaltyEarnings);
router.post('/', addRoyalty);

export default router;
