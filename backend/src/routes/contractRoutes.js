import { Router } from 'express';
import {
  getAllContracts,
  getActiveContracts,
  createContract,
  updateContract,
  deleteContract
} from '../controllers/contractController.js';

const router = Router();

router.get('/', getAllContracts);
router.get('/active', getActiveContracts);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;
