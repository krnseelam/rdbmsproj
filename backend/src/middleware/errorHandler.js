export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // 1. MySQL Custom Trigger / SIGNAL SQLSTATE '45000'
  if (err.sqlState === '45000') {
    return res.status(400).json({
      success: false,
      errorType: 'TRIGGER_VIOLATION',
      message: err.sqlMessage || err.message || 'Database validation failed by trigger',
      sqlState: err.sqlState
    });
  }

  // 2. MySQL Duplicate Entry (1062)
  if (err.errno === 1062) {
    let message = 'A record with these unique details already exists.';
    if (err.sqlMessage && err.sqlMessage.includes('uq_artists_email')) {
      message = 'An artist with this email address already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_producers_email')) {
      message = 'A producer with this email address already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_songwriters_email')) {
      message = 'A songwriter with this email address already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_platforms_name')) {
      message = 'A streaming platform with this name already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_albums_title')) {
      message = 'This artist already has an album with this title.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_songs_track')) {
      message = 'A song with this track number already exists on this album.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_royalties_entry')) {
      message = 'A royalty entry for this song, platform, and period already exists.';
    }
    return res.status(409).json({
      success: false,
      errorType: 'DUPLICATE_ENTRY',
      message,
      detail: err.sqlMessage
    });
  }

  // 3. MySQL Foreign Key Restrict / Referenced Row (1451)
  if (err.errno === 1451) {
    let message = 'Cannot delete or modify this record because related records depend on it.';
    if (err.sqlMessage && err.sqlMessage.includes('fk_albums_artist')) {
      message = 'Cannot delete artist because they have existing albums in the catalogue.';
    } else if (err.sqlMessage && err.sqlMessage.includes('fk_contracts_artist')) {
      message = 'Cannot delete artist because they have contracts on file.';
    } else if (err.sqlMessage && err.sqlMessage.includes('fk_royalties_song')) {
      message = 'Cannot delete song because it has recorded royalties.';
    } else if (err.sqlMessage && err.sqlMessage.includes('fk_royalties_platform')) {
      message = 'Cannot delete platform because it has recorded royalties.';
    }
    return res.status(409).json({
      success: false,
      errorType: 'FOREIGN_KEY_RESTRICTION',
      message,
      detail: err.sqlMessage
    });
  }

  // 4. MySQL Foreign Key Missing Reference (1452)
  if (err.errno === 1452) {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_REFERENCE',
      message: 'Referenced parent record does not exist (invalid artist, album, song, or platform ID).',
      detail: err.sqlMessage
    });
  }

  // 5. MySQL Check Constraint (3819)
  if (err.errno === 3819) {
    let message = 'Check constraint violated.';
    if (err.sqlMessage && err.sqlMessage.includes('ck_artists_debut')) {
      message = 'Debut year must be between 1900 and 2100.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_contracts_percent')) {
      message = 'Royalty percentage must be between 0% and 100%.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_contracts_advance')) {
      message = 'Advance amount cannot be negative.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_contracts_dates')) {
      message = 'Contract end date must be after start date.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_songs_duration')) {
      message = 'Song duration must be greater than 0 seconds.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_songs_track')) {
      message = 'Track number must be greater than 0.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_platforms_rate')) {
      message = 'Rate per stream cannot be negative.';
    } else if (err.sqlMessage && err.sqlMessage.includes('ck_royalties_streams')) {
      message = 'Stream count cannot be negative.';
    }
    return res.status(400).json({
      success: false,
      errorType: 'CHECK_CONSTRAINT_VIOLATION',
      message,
      detail: err.sqlMessage
    });
  }

  // 6. Generic or fallback error
  res.status(err.status || 500).json({
    success: false,
    errorType: 'SERVER_ERROR',
    message: err.message || 'An unexpected internal server error occurred.'
  });
};
