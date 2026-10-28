import pool from '../config/db.js';

export const calculatePayouts = async (req, res, next) => {
  try {
    const { period } = req.body;

    if (!period) {
      return res.status(400).json({
        success: false,
        message: 'Royalty period is required to calculate payouts (e.g., 2026-09-01).'
      });
    }

    // Call stored procedure sp_calculate_payouts
    const [resultSets] = await pool.query('CALL sp_calculate_payouts(?)', [period]);

    // The first element is the SELECT * FROM tmp_payout result set
    const rows = resultSets[0] || [];

    const totalRevenue = rows.reduce((acc, row) => acc + Number(row.revenue || 0), 0);
    const totalPayout = rows.reduce((acc, row) => acc + Number(row.payout || 0), 0);
    const effectiveRate = totalRevenue > 0 ? (totalPayout / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      period,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalPayout: Number(totalPayout.toFixed(2)),
        effectiveRate: Number(effectiveRate.toFixed(2)),
        artistCount: rows.length
      },
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

export const getPayoutPeriods = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT royalty_period FROM royalties ORDER BY royalty_period DESC'
    );
    const periods = rows.map(r => r.royalty_period);
    res.json({ success: true, data: periods });
  } catch (error) {
    next(error);
  }
};
