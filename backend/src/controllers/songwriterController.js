import pool from '../config/db.js';

export const getAllSongwriters = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT sw.songwriter_id, sw.songwriter_name, sw.country, sw.email,
              COUNT(ss.song_id) AS total_songs_written
       FROM songwriters sw
       LEFT JOIN song_songwriters ss ON sw.songwriter_id = ss.songwriter_id
       GROUP BY sw.songwriter_id, sw.songwriter_name, sw.country, sw.email
       ORDER BY sw.songwriter_name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const createSongwriter = async (req, res, next) => {
  try {
    const { songwriter_name, country, email } = req.body;

    if (!songwriter_name || !country || !email) {
      return res.status(400).json({
        success: false,
        message: 'songwriter_name, country, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO songwriters (songwriter_name, country, email) VALUES (?, ?, ?)',
      [songwriter_name.trim(), country.trim(), email.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Songwriter created successfully',
      data: { songwriter_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSongwriter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songwriter_name, country, email } = req.body;

    if (!songwriter_name || !country || !email) {
      return res.status(400).json({
        success: false,
        message: 'songwriter_name, country, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      'UPDATE songwriters SET songwriter_name = ?, country = ?, email = ? WHERE songwriter_id = ?',
      [songwriter_name.trim(), country.trim(), email.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Songwriter not found' });
    }

    res.json({ success: true, message: 'Songwriter updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteSongwriter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM songwriters WHERE songwriter_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Songwriter not found' });
    }

    res.json({ success: true, message: 'Songwriter deleted successfully' });
  } catch (error) {
    next(error);
  }
};
