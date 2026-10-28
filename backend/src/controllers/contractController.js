import pool from '../config/db.js';

export const getAllContracts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.contract_id, c.artist_id, c.start_date, c.end_date,
              c.royalty_percent, c.advance_amount, c.status,
              ar.stage_name AS artist_name
       FROM contracts c
       JOIN artists ar ON c.artist_id = ar.artist_id
       ORDER BY c.status = 'Active' DESC, c.end_date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getActiveContracts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT vac.contract_id, vac.artist_id, vac.start_date, vac.end_date,
              vac.royalty_percent, vac.advance_amount, vac.status,
              ar.stage_name AS artist_name
       FROM v_active_contracts vac
       JOIN artists ar ON vac.artist_id = ar.artist_id
       ORDER BY vac.end_date ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const createContract = async (req, res, next) => {
  try {
    const { artist_id, start_date, end_date, royalty_percent, advance_amount, status } = req.body;

    if (!artist_id || !start_date || !end_date || royalty_percent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'artist_id, start_date, end_date, and royalty_percent are required fields.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO contracts (artist_id, start_date, end_date, royalty_percent, advance_amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(artist_id),
        start_date,
        end_date,
        Number(royalty_percent),
        Number(advance_amount || 0),
        status || 'Active'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: { contract_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { artist_id, start_date, end_date, royalty_percent, advance_amount, status } = req.body;

    if (!artist_id || !start_date || !end_date || royalty_percent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'artist_id, start_date, end_date, and royalty_percent are required fields.'
      });
    }

    const [result] = await pool.query(
      `UPDATE contracts 
       SET artist_id = ?, start_date = ?, end_date = ?, royalty_percent = ?, advance_amount = ?, status = ?
       WHERE contract_id = ?`,
      [
        Number(artist_id),
        start_date,
        end_date,
        Number(royalty_percent),
        Number(advance_amount || 0),
        status || 'Active',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({ success: true, message: 'Contract updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM contracts WHERE contract_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    next(error);
  }
};
