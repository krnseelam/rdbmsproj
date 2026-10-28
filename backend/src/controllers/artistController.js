import pool from '../config/db.js';

export const getAllArtists = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ar.artist_id, ar.stage_name, ar.real_name, ar.country, ar.debut_year, ar.email,
              COALESCE(vas.total_albums, 0) AS total_albums,
              COALESCE(vas.total_songs, 0) AS total_songs
       FROM artists ar
       LEFT JOIN v_artist_summary vas ON ar.artist_id = vas.artist_id
       ORDER BY ar.stage_name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getArtistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query(
      'SELECT artist_id, stage_name, real_name, country, debut_year, email FROM artists WHERE artist_id = ?',
      [id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    const artist = artists[0];

    // Albums
    const [albums] = await pool.query(
      'SELECT album_id, title, release_date FROM albums WHERE artist_id = ? ORDER BY release_date DESC',
      [id]
    );

    // Songs using v_song_details
    const [songs] = await pool.query(
      `SELECT song_id, song_title, duration_seconds, track_number, album_id, album_title, release_date
       FROM v_song_details
       WHERE artist_id = ?
       ORDER BY release_date DESC, track_number ASC`,
      [id]
    );

    // Contracts
    const [contracts] = await pool.query(
      `SELECT contract_id, start_date, end_date, royalty_percent, advance_amount, status
       FROM contracts
       WHERE artist_id = ?
       ORDER BY start_date DESC`,
      [id]
    );

    // Total streams and earnings from v_royalty_earnings
    const [stats] = await pool.query(
      `SELECT COALESCE(SUM(stream_count), 0) AS total_streams,
              COALESCE(SUM(earnings), 0) AS total_earnings
       FROM v_royalty_earnings
       WHERE artist_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...artist,
        albums,
        songs,
        contracts,
        total_streams: Number(stats[0]?.total_streams || 0),
        total_earnings: Number(stats[0]?.total_earnings || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createArtist = async (req, res, next) => {
  try {
    const { stage_name, real_name, country, debut_year, email } = req.body;

    if (!stage_name || !country || !debut_year || !email) {
      return res.status(400).json({
        success: false,
        message: 'stage_name, country, debut_year, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO artists (stage_name, real_name, country, debut_year, email) VALUES (?, ?, ?, ?, ?)',
      [stage_name.trim(), real_name ? real_name.trim() : null, country.trim(), Number(debut_year), email.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Artist created successfully',
      data: { artist_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage_name, real_name, country, debut_year, email } = req.body;

    if (!stage_name || !country || !debut_year || !email) {
      return res.status(400).json({
        success: false,
        message: 'stage_name, country, debut_year, and email are required fields.'
      });
    }

    const [result] = await pool.query(
      `UPDATE artists 
       SET stage_name = ?, real_name = ?, country = ?, debut_year = ?, email = ?
       WHERE artist_id = ?`,
      [stage_name.trim(), real_name ? real_name.trim() : null, country.trim(), Number(debut_year), email.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    res.json({ success: true, message: 'Artist updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM artists WHERE artist_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    res.json({ success: true, message: 'Artist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
