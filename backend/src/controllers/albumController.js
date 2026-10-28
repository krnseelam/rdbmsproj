import pool from '../config/db.js';

export const getAllAlbums = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT al.album_id, al.title, al.release_date, al.artist_id,
              ar.stage_name AS artist_name,
              COUNT(s.song_id) AS song_count,
              COALESCE(SUM(s.duration_seconds), 0) AS total_duration_seconds
       FROM albums al
       JOIN artists ar ON al.artist_id = ar.artist_id
       LEFT JOIN songs s ON al.album_id = s.album_id
       GROUP BY al.album_id, al.title, al.release_date, al.artist_id, ar.stage_name
       ORDER BY al.release_date DESC, al.title ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getAlbumById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [albums] = await pool.query(
      `SELECT al.album_id, al.title, al.release_date, al.artist_id,
              ar.stage_name AS artist_name, ar.country AS artist_country
       FROM albums al
       JOIN artists ar ON al.artist_id = ar.artist_id
       WHERE al.album_id = ?`,
      [id]
    );

    if (albums.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    const album = albums[0];

    // Songs in album using v_song_details
    const [songs] = await pool.query(
      `SELECT vs.song_id, vs.song_title, vs.duration_seconds, vs.track_number,
              (SELECT fn_song_earnings(vs.song_id)) AS song_earnings
       FROM v_song_details vs
       WHERE vs.album_id = ?
       ORDER BY vs.track_number ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...album,
        songs
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, release_date, artist_id } = req.body;

    if (!title || !release_date || !artist_id) {
      return res.status(400).json({
        success: false,
        message: 'title, release_date, and artist_id are required fields.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO albums (title, release_date, artist_id) VALUES (?, ?, ?)',
      [title.trim(), release_date, Number(artist_id)]
    );

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: { album_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, release_date, artist_id } = req.body;

    if (!title || !release_date || !artist_id) {
      return res.status(400).json({
        success: false,
        message: 'title, release_date, and artist_id are required fields.'
      });
    }

    const [result] = await pool.query(
      'UPDATE albums SET title = ?, release_date = ?, artist_id = ? WHERE album_id = ?',
      [title.trim(), release_date, Number(artist_id), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    res.json({ success: true, message: 'Album updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM albums WHERE album_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    res.json({ success: true, message: 'Album deleted successfully' });
  } catch (error) {
    next(error);
  }
};
