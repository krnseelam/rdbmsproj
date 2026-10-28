
-- Student : Karan Kumar Seelam   |  Reg. No. 2502050710  |  Section E4
-- DDL
-- =====================================================================

DROP DATABASE IF EXISTS music_label_db;
CREATE DATABASE music_label_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE music_label_db;

CREATE TABLE artists (
    artist_id   INT          NOT NULL AUTO_INCREMENT,
    stage_name  VARCHAR(100) NOT NULL,
    real_name   VARCHAR(100),
    country     VARCHAR(50)  NOT NULL,
    debut_year  INT          NOT NULL,
    email       VARCHAR(100) NOT NULL,
    CONSTRAINT pk_artists        PRIMARY KEY (artist_id),
    CONSTRAINT uq_artists_email  UNIQUE (email),
    CONSTRAINT ck_artists_debut  CHECK (debut_year BETWEEN 1900 AND 2100)
);


CREATE TABLE albums (
    album_id      INT          NOT NULL AUTO_INCREMENT,
    title         VARCHAR(150) NOT NULL,
    release_date  DATE         NOT NULL,
    artist_id     INT          NOT NULL,
    CONSTRAINT pk_albums         PRIMARY KEY (album_id),
    CONSTRAINT uq_albums_title   UNIQUE (artist_id, title),
    CONSTRAINT fk_albums_artist  FOREIGN KEY (artist_id)
        REFERENCES artists (artist_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ;

CREATE TABLE songs (
    song_id           INT          NOT NULL AUTO_INCREMENT,
    title             VARCHAR(150) NOT NULL,
    duration_seconds  INT          NOT NULL,
    track_number      INT          NOT NULL,
    album_id          INT          NOT NULL,
    CONSTRAINT pk_songs           PRIMARY KEY (song_id),
    CONSTRAINT uq_songs_track     UNIQUE (album_id, track_number),
    CONSTRAINT ck_songs_duration  CHECK (duration_seconds > 0),
    CONSTRAINT ck_songs_track     CHECK (track_number > 0),
    CONSTRAINT fk_songs_album     FOREIGN KEY (album_id)
        REFERENCES albums (album_id)
        ON DELETE CASCADE ON UPDATE CASCADE
)  ;


CREATE TABLE producers (
    producer_id    INT          NOT NULL AUTO_INCREMENT,
    producer_name  VARCHAR(100) NOT NULL,
    country        VARCHAR(50)  NOT NULL,
    email          VARCHAR(100) NOT NULL,
    CONSTRAINT pk_producers        PRIMARY KEY (producer_id),
    CONSTRAINT uq_producers_email  UNIQUE (email)
);


CREATE TABLE songwriters (
    songwriter_id    INT          NOT NULL AUTO_INCREMENT,
    songwriter_name  VARCHAR(100) NOT NULL,
    country          VARCHAR(50)  NOT NULL,
    email            VARCHAR(100) NOT NULL,
    CONSTRAINT pk_songwriters        PRIMARY KEY (songwriter_id),
    CONSTRAINT uq_songwriters_email  UNIQUE (email)
) ;


CREATE TABLE contracts (
    contract_id      INT           NOT NULL AUTO_INCREMENT,
    artist_id        INT           NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    royalty_percent  DECIMAL(5,2)  NOT NULL,
    advance_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    status           ENUM('Active','Expired','Terminated') NOT NULL DEFAULT 'Active',
    CONSTRAINT pk_contracts          PRIMARY KEY (contract_id),
    CONSTRAINT ck_contracts_percent  CHECK (royalty_percent BETWEEN 0 AND 100),
    CONSTRAINT ck_contracts_advance  CHECK (advance_amount >= 0),
    CONSTRAINT ck_contracts_dates    CHECK (end_date > start_date),
    CONSTRAINT fk_contracts_artist   FOREIGN KEY (artist_id)
        REFERENCES artists (artist_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ;


CREATE TABLE streaming_platforms (
    platform_id      INT           NOT NULL AUTO_INCREMENT,
    platform_name    VARCHAR(80)   NOT NULL,
    rate_per_stream  DECIMAL(10,6) NOT NULL,
    website          VARCHAR(150),
    CONSTRAINT pk_platforms       PRIMARY KEY (platform_id),
    CONSTRAINT uq_platforms_name  UNIQUE (platform_name),
    CONSTRAINT ck_platforms_rate  CHECK (rate_per_stream >= 0)
) ;

CREATE TABLE royalties (
    royalty_id      INT    NOT NULL AUTO_INCREMENT,
    song_id         INT    NOT NULL,
    platform_id     INT    NOT NULL,
    royalty_period  DATE   NOT NULL,          -- first day of the month
    stream_count    BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT pk_royalties         PRIMARY KEY (royalty_id),
    CONSTRAINT uq_royalties_entry   UNIQUE (song_id, platform_id, royalty_period),
    CONSTRAINT ck_royalties_streams CHECK (stream_count >= 0),
    CONSTRAINT fk_royalties_song    FOREIGN KEY (song_id)
        REFERENCES songs (song_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_royalties_platform FOREIGN KEY (platform_id)
        REFERENCES streaming_platforms (platform_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ;


CREATE TABLE song_producers (
    song_id      INT NOT NULL,
    producer_id  INT NOT NULL,
    CONSTRAINT pk_song_producers PRIMARY KEY (song_id, producer_id),
    CONSTRAINT fk_sp_song     FOREIGN KEY (song_id)
        REFERENCES songs (song_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sp_producer FOREIGN KEY (producer_id)
        REFERENCES producers (producer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ;

CREATE TABLE song_songwriters (
    song_id        INT NOT NULL,
    songwriter_id  INT NOT NULL,
    CONSTRAINT pk_song_songwriters PRIMARY KEY (song_id, songwriter_id),
    CONSTRAINT fk_ss_song       FOREIGN KEY (song_id)
        REFERENCES songs (song_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ss_songwriter FOREIGN KEY (songwriter_id)
        REFERENCES songwriters (songwriter_id) ON DELETE CASCADE ON UPDATE CASCADE
) ;

CREATE INDEX idx_songs_title      ON songs (title);
CREATE INDEX idx_artists_name     ON artists (stage_name);
CREATE INDEX idx_royalties_period ON royalties (royalty_period);

ALTER TABLE producers ADD COLUMN phone VARCHAR(20);
ALTER TABLE producers MODIFY COLUMN phone VARCHAR(25);
ALTER TABLE producers DROP COLUMN phone;

SHOW TABLES;

-- Student : Karan Kumar Seelam   |  Reg. No. 2502050710  |  Section E4
-- DML

USE music_label_db;

INSERT INTO artists (stage_name, real_name, country, debut_year, email) VALUES
('Aarav Sen',          'Aarav Sengupta', 'India',  2015, 'aarav.sen@example.com'),
('Luna Park',          'Lena Parker',    'USA',    2012, 'luna.park@example.com'),
('The Midnight Owls',  NULL,             'UK',     2010, 'owls@example.com'),
('Riya Kapoor',        'Riya Kapoor',    'India',  2018, 'riya.kapoor@example.com'),
('DJ Nova',            'Marco Silva',    'Brazil', 2016, 'dj.nova@example.com'),
('Kenji Ito',          'Kenji Ito',      'Japan',  2019, 'kenji.ito@example.com'),
('Meera Das',          'Meera Das',      'India',  2024, 'meera.das@example.com');


INSERT INTO albums (title, release_date, artist_id) VALUES
('Monsoon Nights',       '2019-07-12', 1),
('City Lights',          '2021-03-05', 1),
('Neon Skies',           '2018-10-20', 2),
('Paper Hearts',         '2022-02-14', 2),
('Nocturnal',            '2016-11-01', 3),
('Echoes',               '2020-09-18', 4),
('Rhythm Machine',       '2023-05-26', 5),
('Tokyo Drift Sessions', '2024-01-19', 6);

INSERT INTO songs (title, duration_seconds, track_number, album_id) VALUES
('Barsaat',          215, 1, 1),
('Chai Aur Tum',     198, 2, 1),
('Raat Ka Safar',    242, 3, 1),
('City Lights',      205, 1, 2),
('Midnight Metro',   221, 2, 2),
('Neon Skies',       233, 1, 3),
('Electric Dreams',  189, 2, 3),
('Skyline',          250, 3, 3),
('Paper Hearts',     210, 1, 4),
('Whispers',         195, 2, 4),
('Owl Song',         260, 1, 5),
('Moonrise',         275, 2, 5),
('Dark Forest',      240, 3, 5),
('Echoes',           207, 1, 6),
('Lost In You',      224, 2, 6),
('Bass Drop',        180, 1, 7),
('Dance Floor',      192, 2, 7),
('Tokyo Nights',     215, 1, 8),
('Sakura',           228, 2, 8);


INSERT INTO producers (producer_name, country, email) VALUES
('Vikram Rao',    'India',  'vikram.rao@example.com'),
('Sarah Collins', 'USA',    'sarah.collins@example.com'),
('Tom Hughes',    'UK',     'tom.hughes@example.com'),
('Ana Costa',     'Brazil', 'ana.costa@example.com'),
('Hiro Tanaka',   'Japan',  'hiro.tanaka@example.com');


INSERT INTO songwriters (songwriter_name, country, email) VALUES
('Aarav Sengupta', 'India', 'aarav.writer@example.com'),
('Emily Stone',    'USA',   'emily.stone@example.com'),
('James Wright',   'UK',    'james.wright@example.com'),
('Priya Menon',    'India', 'priya.menon@example.com'),
('Yuki Mori',      'Japan', 'yuki.mori@example.com');

INSERT INTO song_producers (song_id, producer_id) VALUES
(1,1),(2,1),(3,1),(4,1),(4,2),(5,1),
(6,2),(7,2),(8,2),(9,2),(9,3),(10,2),
(11,3),(12,3),(13,3),(14,1),(15,1),
(16,4),(17,4),(18,5),(19,5);


INSERT INTO song_songwriters (song_id, songwriter_id) VALUES
(1,1),(2,1),(2,4),(3,1),(4,1),(5,4),
(6,2),(7,2),(8,2),(9,2),(10,2),
(11,3),(12,3),(13,3),(14,4),(15,4),
(16,2),(17,2),(18,5),(19,5);


INSERT INTO contracts (artist_id, start_date, end_date, royalty_percent, advance_amount, status) VALUES
(1, '2015-01-01', '2028-12-31', 15.00, 500000.00, 'Active'),
(2, '2012-06-01', '2022-05-31', 12.50, 400000.00, 'Expired'),
(2, '2022-06-01', '2027-05-31', 18.00, 750000.00, 'Active'),
(3, '2010-03-01', '2020-02-28', 10.00, 300000.00, 'Expired'),
(3, '2020-03-01', '2028-02-28', 14.00, 600000.00, 'Active'),
(4, '2018-08-01', '2026-07-31', 12.00, 200000.00, 'Expired'),
(5, '2016-04-01', '2029-03-31', 20.00, 250000.00, 'Active'),
(6, '2019-09-01', '2024-12-31', 11.00, 150000.00, 'Terminated'),
(7, '2024-06-01', '2027-05-31', 12.00,  50000.00, 'Active');

INSERT INTO streaming_platforms (platform_name, rate_per_stream, website) VALUES
('Spotify',       0.004000, 'https://www.spotify.com'),
('Apple Music',   0.008000, 'https://music.apple.com'),
('YouTube Music', 0.002000, 'https://music.youtube.com'),
('Amazon Music',  0.004000, 'https://music.amazon.com'),
('JioSaavn',      0.001500, 'https://www.jiosaavn.com');


INSERT INTO royalties (song_id, platform_id, royalty_period, stream_count) VALUES

(1, 1,'2026-09-01',1250000),(1, 2,'2026-09-01', 430000),(2, 1,'2026-09-01', 980000),
(3, 1,'2026-09-01', 760000),(4, 1,'2026-09-01',1100000),(4, 3,'2026-09-01', 640000),
(5, 2,'2026-09-01', 520000),(6, 1,'2026-09-01',2100000),(6, 2,'2026-09-01', 900000),
(7, 1,'2026-09-01',1500000),(8, 4,'2026-09-01', 870000),(9, 1,'2026-09-01',1900000),
(10,3,'2026-09-01', 450000),(11,1,'2026-09-01', 700000),(12,2,'2026-09-01', 610000),
(13,5,'2026-09-01', 300000),(14,1,'2026-09-01', 820000),(15,5,'2026-09-01', 950000),
(16,1,'2026-09-01',3200000),(16,3,'2026-09-01',1400000),(17,1,'2026-09-01',2800000),
(18,2,'2026-09-01', 740000),(19,4,'2026-09-01', 560000),

(1, 1,'2026-08-01',1180000),(1, 2,'2026-08-01', 400000),(6, 1,'2026-08-01',2000000),
(9, 1,'2026-08-01',1750000),(16,1,'2026-08-01',3000000),(17,1,'2026-08-01',2500000),
(18,2,'2026-08-01', 700000);

SELECT 'artists' AS table_name, COUNT(*) AS row_count, 7 AS expected FROM artists
UNION ALL SELECT 'albums',              COUNT(*),  8 FROM albums
UNION ALL SELECT 'songs',               COUNT(*), 19 FROM songs
UNION ALL SELECT 'producers',           COUNT(*),  5 FROM producers
UNION ALL SELECT 'songwriters',         COUNT(*),  5 FROM songwriters
UNION ALL SELECT 'contracts',           COUNT(*),  9 FROM contracts
UNION ALL SELECT 'streaming_platforms', COUNT(*),  5 FROM streaming_platforms
UNION ALL SELECT 'royalties',           COUNT(*), 30 FROM royalties
UNION ALL SELECT 'song_producers',      COUNT(*), 21 FROM song_producers
UNION ALL SELECT 'song_songwriters',    COUNT(*), 20 FROM song_songwriters;


-- Student : Karan Kumar Seelam   |  Reg. No. 2502050710  |  Section E4
-- views, procedures and triggers

USE music_label_db;

-- views

-- A1. Songs with their album and artist
CREATE OR REPLACE VIEW v_song_details AS
SELECT s.song_id,
       s.title            AS song_title,
       s.duration_seconds,
       s.track_number,
       al.album_id,
       al.title           AS album_title,
       al.release_date,
       ar.artist_id,
       ar.stage_name      AS artist_name
FROM songs s
JOIN albums  al ON s.album_id  = al.album_id
JOIN artists ar ON al.artist_id = ar.artist_id;

-- A2. Royalty earnings (money is calculated here, not stored in a table)
CREATE OR REPLACE VIEW v_royalty_earnings AS
SELECT r.royalty_id,
       s.song_id,
       s.title                                      AS song_title,
       ar.artist_id,
       ar.stage_name                                AS artist_name,
       p.platform_name,
       r.royalty_period,
       r.stream_count,
       p.rate_per_stream,
       ROUND(r.stream_count * p.rate_per_stream, 2) AS earnings
FROM royalties r
JOIN songs               s  ON r.song_id     = s.song_id
JOIN albums              al ON s.album_id    = al.album_id
JOIN artists             ar ON al.artist_id  = ar.artist_id
JOIN streaming_platforms p  ON r.platform_id = p.platform_id;

CREATE OR REPLACE VIEW v_artist_summary AS
SELECT ar.artist_id,
       ar.stage_name,
       COUNT(DISTINCT al.album_id) AS total_albums,
       COUNT(DISTINCT s.song_id)   AS total_songs
FROM artists ar
LEFT JOIN albums al ON al.artist_id = ar.artist_id
LEFT JOIN songs  s  ON s.album_id   = al.album_id
GROUP BY ar.artist_id, ar.stage_name;

CREATE OR REPLACE VIEW v_active_contracts AS
SELECT contract_id, artist_id, start_date, end_date,
       royalty_percent, advance_amount, status
FROM contracts
WHERE status = 'Active'
WITH CHECK OPTION;

-- functions, procedures and triggers
DELIMITER $$

-- functions
DROP FUNCTION IF EXISTS fn_song_earnings$$
CREATE FUNCTION fn_song_earnings(p_song_id INT)
RETURNS DECIMAL(14,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(14,2);
    SELECT IFNULL(SUM(r.stream_count * p.rate_per_stream), 0)
      INTO v_total
      FROM royalties r
      JOIN streaming_platforms p ON r.platform_id = p.platform_id
     WHERE r.song_id = p_song_id;
    RETURN ROUND(v_total, 2);
END$$

-- procedures 
DROP PROCEDURE IF EXISTS sp_add_royalty$$
CREATE PROCEDURE sp_add_royalty(
    IN p_song_id     INT,
    IN p_platform_id INT,
    IN p_period      DATE,
    IN p_streams     BIGINT)
BEGIN
    INSERT INTO royalties (song_id, platform_id, royalty_period, stream_count)
    VALUES (p_song_id, p_platform_id, p_period, p_streams)
    ON DUPLICATE KEY UPDATE stream_count = stream_count + p_streams;
END$$


DROP PROCEDURE IF EXISTS sp_calculate_payouts$$
CREATE PROCEDURE sp_calculate_payouts(IN p_period DATE)
BEGIN
    DECLARE v_done   INT DEFAULT 0;
    DECLARE v_id     INT;
    DECLARE v_name   VARCHAR(100);
    DECLARE v_rev    DECIMAL(14,2);
    DECLARE v_pct    DECIMAL(5,2);

    DECLARE cur_artists CURSOR FOR
        SELECT artist_id, stage_name FROM artists ORDER BY artist_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    DROP TEMPORARY TABLE IF EXISTS tmp_payout;
    CREATE TEMPORARY TABLE tmp_payout (
        artist_id        INT,
        stage_name       VARCHAR(100),
        revenue          DECIMAL(14,2),
        royalty_percent  DECIMAL(5,2),
        payout           DECIMAL(14,2)
    );

    OPEN cur_artists;
    read_loop: LOOP
        FETCH cur_artists INTO v_id, v_name;
        IF v_done = 1 THEN
            LEAVE read_loop;
        END IF;

        SELECT IFNULL(SUM(r.stream_count * p.rate_per_stream), 0)
          INTO v_rev
          FROM royalties r
          JOIN songs  s  ON r.song_id     = s.song_id
          JOIN albums al ON s.album_id    = al.album_id
          JOIN streaming_platforms p ON r.platform_id = p.platform_id
         WHERE al.artist_id = v_id
           AND r.royalty_period = p_period;

        SELECT IFNULL(MAX(royalty_percent), 0)
          INTO v_pct
          FROM contracts
         WHERE artist_id = v_id AND status = 'Active';

        INSERT INTO tmp_payout
        VALUES (v_id, v_name, ROUND(v_rev, 2), v_pct, ROUND(v_rev * v_pct / 100, 2));
    END LOOP;
    CLOSE cur_artists;

    SELECT * FROM tmp_payout ORDER BY payout DESC;
END$$

-- triggers

DROP TRIGGER IF EXISTS trg_royalties_before_insert$$
CREATE TRIGGER trg_royalties_before_insert
BEFORE INSERT ON royalties
FOR EACH ROW
BEGIN
    DECLARE v_release DATE;
    SELECT al.release_date INTO v_release
      FROM songs s JOIN albums al ON s.album_id = al.album_id
     WHERE s.song_id = NEW.song_id;
    IF v_release IS NOT NULL AND LAST_DAY(NEW.royalty_period) < v_release THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Royalty period is before the album release date';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_royalties_before_update$$
CREATE TRIGGER trg_royalties_before_update
BEFORE UPDATE ON royalties
FOR EACH ROW
BEGIN
    DECLARE v_release DATE;
    SELECT al.release_date INTO v_release
      FROM songs s JOIN albums al ON s.album_id = al.album_id
     WHERE s.song_id = NEW.song_id;
    IF v_release IS NOT NULL AND LAST_DAY(NEW.royalty_period) < v_release THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Royalty period is before the album release date';
    END IF;
END$$


DROP TRIGGER IF EXISTS trg_contracts_before_insert$$
CREATE TRIGGER trg_contracts_before_insert
BEFORE INSERT ON contracts
FOR EACH ROW
BEGIN
    IF NEW.status = 'Active' AND NEW.end_date < CURDATE() THEN
        SET NEW.status = 'Expired';
    END IF;

    IF NEW.status = 'Active' AND EXISTS (
        SELECT 1 FROM contracts c
         WHERE c.artist_id = NEW.artist_id
           AND c.status    = 'Active'
           AND NEW.start_date <= c.end_date
           AND NEW.end_date   >= c.start_date) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Artist already has an overlapping Active contract';
    END IF;
END$$

DELIMITER ;

