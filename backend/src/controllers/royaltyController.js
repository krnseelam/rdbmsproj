import pool from '../config/db.js';

export const getRoyaltyRecords = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.royalty_id, r.song_id, s.title AS song_title,
              ar.artist_id, ar.stage_name AS artist_name,
              p.platform_id, p.platform_name,
              r.royalty_period, r.stream_count
       FROM royalties r
       JOIN songs s ON r.song_id = s.song_id
       JOIN albums al ON s.album_id = al.album_id
       JOIN artists ar ON al.artist_id = ar.artist_id
       JOIN streaming_platforms p ON r.platform_id = p.platform_id
       ORDER BY r.royalty_period DESC, r.stream_count DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getRoyaltyEarnings = async (req, res, next) => {
  try {
    const { artist_id, platform_name, period } = req.query;

    let query = `
      SELECT royalty_id, song_id, song_title, artist_id, artist_name,
             platform_name, royalty_period, stream_count, rate_per_stream, earnings
      FROM v_royalty_earnings
      WHERE 1=1
    `;
    const params = [];

    if (artist_id) {
      query += ' AND artist_id = ?';
      params.push(Number(artist_id));
    }

    if (platform_name) {
      query += ' AND platform_name = ?';
      params.push(platform_name);
    }

    if (period) {
      // Allow exact date like 2026-09-01 or month prefix like 2026-09
      query += ' AND (royalty_period = ? OR DATE_FORMAT(royalty_period, "%Y-%m") = ?)';
      params.push(period, period);
    }

    query += ' ORDER BY royalty_period DESC, earnings DESC';

    const [rows] = await pool.query(query, params);

    // Summary calculation for this filtered set
    const totalEarnings = rows.reduce((acc, row) => acc + Number(row.earnings || 0), 0);
    const totalStreams = rows.reduce((acc, row) => acc + Number(row.stream_count || 0), 0);

    res.json({
      success: true,
      data: rows,
      summary: {
        totalEarnings: Number(totalEarnings.toFixed(2)),
        totalStreams,
        recordCount: rows.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addRoyalty = async (req, res, next) => {
  try {
    const { song_id, platform_id, period, streams } = req.body;

    if (!song_id || !platform_id || !period || streams === undefined) {
      return res.status(400).json({
        success: false,
        message: 'song_id, platform_id, period, and streams are required fields.'
      });
    }

    // Call stored procedure sp_add_royalty directly
    await pool.query('CALL sp_add_royalty(?, ?, ?, ?)', [
      Number(song_id),
      Number(platform_id),
      period,
      Number(streams)
    ]);

    res.status(201).json({
      success: true,
      message: 'Royalty recorded successfully (processed via sp_add_royalty)'
    });
  } catch (error) {
    next(error);
  }
};
