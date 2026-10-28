import pool from '../config/db.js';

export const getAllSongs = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT vs.song_id,
              vs.song_title,
              vs.duration_seconds,
              vs.track_number,
              vs.album_id,
              vs.album_title,
              vs.release_date,
              vs.artist_id,
              vs.artist_name,
              fn_song_earnings(vs.song_id) AS earnings,
              (SELECT GROUP_CONCAT(p.producer_name ORDER BY p.producer_name SEPARATOR ', ')
               FROM song_producers sp
               JOIN producers p ON sp.producer_id = p.producer_id
               WHERE sp.song_id = vs.song_id) AS producers,
              (SELECT GROUP_CONCAT(sw.songwriter_name ORDER BY sw.songwriter_name SEPARATOR ', ')
               FROM song_songwriters ss
               JOIN songwriters sw ON ss.songwriter_id = sw.songwriter_id
               WHERE ss.song_id = vs.song_id) AS songwriters
       FROM v_song_details vs
       ORDER BY vs.artist_name ASC, vs.album_title ASC, vs.track_number ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [songs] = await pool.query(
      `SELECT vs.song_id,
              vs.song_title,
              vs.duration_seconds,
              vs.track_number,
              vs.album_id,
              vs.album_title,
              vs.release_date,
              vs.artist_id,
              vs.artist_name,
              fn_song_earnings(vs.song_id) AS earnings
       FROM v_song_details vs
       WHERE vs.song_id = ?`,
      [id]
    );

    if (songs.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const song = songs[0];

    // Producers
    const [producers] = await pool.query(
      `SELECT p.producer_id, p.producer_name, p.country, p.email
       FROM song_producers sp
       JOIN producers p ON sp.producer_id = p.producer_id
       WHERE sp.song_id = ?
       ORDER BY p.producer_name ASC`,
      [id]
    );

    // Songwriters
    const [songwriters] = await pool.query(
      `SELECT sw.songwriter_id, sw.songwriter_name, sw.country, sw.email
       FROM song_songwriters ss
       JOIN songwriters sw ON ss.songwriter_id = sw.songwriter_id
       WHERE ss.song_id = ?
       ORDER BY sw.songwriter_name ASC`,
      [id]
    );

    // Royalties breakdown
    const [royalties] = await pool.query(
      `SELECT r.royalty_id, r.royalty_period, r.stream_count,
              p.platform_id, p.platform_name, p.rate_per_stream,
              ROUND(r.stream_count * p.rate_per_stream, 2) AS earnings
       FROM royalties r
       JOIN streaming_platforms p ON r.platform_id = p.platform_id
       WHERE r.song_id = ?
       ORDER BY r.royalty_period DESC, earnings DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...song,
        producers,
        songwriters,
        royalties
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSong = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { title, duration_seconds, track_number, album_id, producer_ids, songwriter_ids } = req.body;

    if (!title || !duration_seconds || !track_number || !album_id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'title, duration_seconds, track_number, and album_id are required fields.'
      });
    }

    const [songResult] = await connection.query(
      'INSERT INTO songs (title, duration_seconds, track_number, album_id) VALUES (?, ?, ?, ?)',
      [title.trim(), Number(duration_seconds), Number(track_number), Number(album_id)]
    );

    const songId = songResult.insertId;

    if (Array.isArray(producer_ids) && producer_ids.length > 0) {
      const producerValues = producer_ids.map(pid => [songId, Number(pid)]);
      await connection.query('INSERT INTO song_producers (song_id, producer_id) VALUES ?', [producerValues]);
    }

    if (Array.isArray(songwriter_ids) && songwriter_ids.length > 0) {
      const writerValues = songwriter_ids.map(wid => [songId, Number(wid)]);
      await connection.query('INSERT INTO song_songwriters (song_id, songwriter_id) VALUES ?', [writerValues]);
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: { song_id: songId }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

export const updateSong = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { title, duration_seconds, track_number, album_id, producer_ids, songwriter_ids } = req.body;

    if (!title || !duration_seconds || !track_number || !album_id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'title, duration_seconds, track_number, and album_id are required fields.'
      });
    }

    const [songResult] = await connection.query(
      'UPDATE songs SET title = ?, duration_seconds = ?, track_number = ?, album_id = ? WHERE song_id = ?',
      [title.trim(), Number(duration_seconds), Number(track_number), Number(album_id), id]
    );

    if (songResult.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    if (Array.isArray(producer_ids)) {
      await connection.query('DELETE FROM song_producers WHERE song_id = ?', [id]);
      if (producer_ids.length > 0) {
        const producerValues = producer_ids.map(pid => [id, Number(pid)]);
        await connection.query('INSERT INTO song_producers (song_id, producer_id) VALUES ?', [producerValues]);
      }
    }

    if (Array.isArray(songwriter_ids)) {
      await connection.query('DELETE FROM song_songwriters WHERE song_id = ?', [id]);
      if (songwriter_ids.length > 0) {
        const writerValues = songwriter_ids.map(wid => [id, Number(wid)]);
        await connection.query('INSERT INTO song_songwriters (song_id, songwriter_id) VALUES ?', [writerValues]);
      }
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Song updated successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM songs WHERE song_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    next(error);
  }
};
