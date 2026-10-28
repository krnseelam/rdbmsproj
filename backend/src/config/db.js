import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sslOption =
  process.env.DB_SSL === 'true' || (process.env.VERCEL && process.env.DB_SSL !== 'false')
    ? { rejectUnauthorized: false }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'label_app',
  password: process.env.DB_PASSWORD || 'App@12345',
  database: process.env.DB_NAME || 'music_label_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
  ...(sslOption && { ssl: sslOption }),
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `[MySQL] Connected to database "${process.env.DB_NAME || 'music_label_db'}" as "${
        process.env.DB_USER || 'label_app'
      }"`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error('[MySQL] Connection failed:', error.message);
    return false;
  }
};

export default pool;
