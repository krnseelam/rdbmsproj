import pool from '../config/db.js';

export const getAllPlatforms = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.platform_id, p.platform_name, p.rate_per_stream, p.website,
              COALESCE(SUM(r.stream_count), 0) AS total_streams,
              COALESCE(SUM(ROUND(r.stream_count * p.rate_per_stream, 2)), 0) AS total_earnings
       FROM streaming_platforms p
       LEFT JOIN royalties r ON p.platform_id = r.platform_id
       GROUP BY p.platform_id, p.platform_name, p.rate_per_stream, p.website
       ORDER BY total_streams DESC, p.platform_name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const createPlatform = async (req, res, next) => {
  try {
    const { platform_name, rate_per_stream, website } = req.body;

    if (!platform_name || rate_per_stream === undefined) {
      return res.status(400).json({
        success: false,
        message: 'platform_name and rate_per_stream are required fields.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO streaming_platforms (platform_name, rate_per_stream, website) VALUES (?, ?, ?)',
      [platform_name.trim(), Number(rate_per_stream), website ? website.trim() : null]
    );

    res.status(201).json({
      success: true,
      message: 'Streaming platform created successfully',
      data: { platform_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlatform = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { platform_name, rate_per_stream, website } = req.body;

    if (!platform_name || rate_per_stream === undefined) {
      return res.status(400).json({
        success: false,
        message: 'platform_name and rate_per_stream are required fields.'
      });
    }

    const [result] = await pool.query(
      'UPDATE streaming_platforms SET platform_name = ?, rate_per_stream = ?, website = ? WHERE platform_id = ?',
      [platform_name.trim(), Number(rate_per_stream), website ? website.trim() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Platform not found' });
    }

    res.json({ success: true, message: 'Streaming platform updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePlatform = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM streaming_platforms WHERE platform_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Platform not found' });
    }

    res.json({ success: true, message: 'Streaming platform deleted successfully' });
  } catch (error) {
    next(error);
  }
};
