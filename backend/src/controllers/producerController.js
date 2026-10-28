import pool from '../config/db.js';

export const getAllProducers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.producer_id, p.producer_name, p.country, p.email,
              COUNT(sp.song_id) AS total_songs_produced
       FROM producers p
       LEFT JOIN song_producers sp ON p.producer_id = sp.producer_id
       GROUP BY p.producer_id, p.producer_name, p.country, p.email
       ORDER BY p.producer_name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const createProducer = async (req, res, next) => {
  try {
    const { producer_name, country, email } = req.body;

    if (!producer_name || !country || !email) {
      return res.status(400).json({
        success: false,
        message: 'producer_name, country, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO producers (producer_name, country, email) VALUES (?, ?, ?)',
      [producer_name.trim(), country.trim(), email.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Producer created successfully',
      data: { producer_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProducer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { producer_name, country, email } = req.body;

    if (!producer_name || !country || !email) {
      return res.status(400).json({
        success: false,
        message: 'producer_name, country, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      'UPDATE producers SET producer_name = ?, country = ?, email = ? WHERE producer_id = ?',
      [producer_name.trim(), country.trim(), email.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producer not found' });
    }

    res.json({ success: true, message: 'Producer updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteProducer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM producers WHERE producer_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producer not found' });
    }

    res.json({ success: true, message: 'Producer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
