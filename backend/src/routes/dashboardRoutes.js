import { Router } from 'express';
import {
  getDashboardStats,
  getMonthlyEarnings,
  getTopArtists,
  getTopSongs,
  getPlatformDistribution
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/earnings', getMonthlyEarnings);
router.get('/top-artists', getTopArtists);
router.get('/top-songs', getTopSongs);
router.get('/platforms', getPlatformDistribution);

export default router;
