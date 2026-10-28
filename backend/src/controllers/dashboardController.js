import pool from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM artists) AS total_artists,
         (SELECT COUNT(*) FROM albums) AS total_albums,
         (SELECT COUNT(*) FROM songs) AS total_songs,
         (SELECT COUNT(*) FROM producers) AS total_producers,
         (SELECT COUNT(*) FROM songwriters) AS total_songwriters,
         (SELECT COUNT(*) FROM v_active_contracts) AS active_contracts,
         (SELECT COALESCE(SUM(stream_count), 0) FROM royalties) AS total_streams,
         (SELECT COALESCE(SUM(earnings), 0) FROM v_royalty_earnings) AS total_earnings`
    );

    const stats = rows[0] || {};
    res.json({
      success: true,
      data: {
        total_artists: Number(stats.total_artists || 0),
        total_albums: Number(stats.total_albums || 0),
        total_songs: Number(stats.total_songs || 0),
        total_producers: Number(stats.total_producers || 0),
        total_songwriters: Number(stats.total_songwriters || 0),
        active_contracts: Number(stats.active_contracts || 0),
        total_streams: Number(stats.total_streams || 0),
        total_earnings: Number(stats.total_earnings || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyEarnings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT royalty_period,
              ROUND(SUM(earnings), 2) AS total_earnings,
              SUM(stream_count) AS total_streams
       FROM v_royalty_earnings
       GROUP BY royalty_period
       ORDER BY royalty_period ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getTopArtists = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT artist_id, artist_name,
              ROUND(SUM(earnings), 2) AS total_earnings,
              SUM(stream_count) AS total_streams
       FROM v_royalty_earnings
       GROUP BY artist_id, artist_name
       ORDER BY total_earnings DESC
       LIMIT 5`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getTopSongs = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT song_id, song_title, artist_name,
              SUM(stream_count) AS total_streams,
              ROUND(SUM(earnings), 2) AS total_earnings
       FROM v_royalty_earnings
       GROUP BY song_id, song_title, artist_name
       ORDER BY total_streams DESC
       LIMIT 5`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getPlatformDistribution = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT platform_name,
              SUM(stream_count) AS total_streams,
              ROUND(SUM(earnings), 2) AS total_earnings
       FROM v_royalty_earnings
       GROUP BY platform_name
       ORDER BY total_streams DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
