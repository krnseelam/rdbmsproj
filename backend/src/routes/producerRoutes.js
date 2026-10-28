import { Router } from 'express';
import {
  getAllProducers,
  createProducer,
  updateProducer,
  deleteProducer
} from '../controllers/producerController.js';

const router = Router();

router.get('/', getAllProducers);
router.post('/', createProducer);
router.put('/:id', updateProducer);
router.delete('/:id', deleteProducer);

export default router;
