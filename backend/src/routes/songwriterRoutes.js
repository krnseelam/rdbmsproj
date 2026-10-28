import { Router } from 'express';
import {
  getAllSongwriters,
  createSongwriter,
  updateSongwriter,
  deleteSongwriter
} from '../controllers/songwriterController.js';

const router = Router();

router.get('/', getAllSongwriters);
router.post('/', createSongwriter);
router.put('/:id', updateSongwriter);
router.delete('/:id', deleteSongwriter);

export default router;
