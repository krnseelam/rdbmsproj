import { Router } from 'express';
import {
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform
} from '../controllers/platformController.js';

const router = Router();

router.get('/', getAllPlatforms);
router.post('/', createPlatform);
router.put('/:id', updatePlatform);
router.delete('/:id', deletePlatform);

export default router;
