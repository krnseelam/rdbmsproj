
-- Student : Karan Kumar Seelam   |  Reg. No. 2502050710  |  Section E4
-- User Management 


USE music_label_db;



DROP USER IF EXISTS 'label_admin'@'localhost';
DROP USER IF EXISTS 'label_app'@'localhost';
DROP USER IF EXISTS 'label_viewer'@'localhost';

CREATE USER 'label_admin'@'localhost'  IDENTIFIED BY 'Admin@123';
CREATE USER 'label_app'@'localhost'    IDENTIFIED BY 'App@12345';
CREATE USER 'label_viewer'@'localhost' IDENTIFIED BY 'View@123';


GRANT ALL PRIVILEGES ON music_label_db.* TO 'label_admin'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
      ON music_label_db.* TO 'label_app'@'localhost';

GRANT SELECT ON music_label_db.* TO 'label_viewer'@'localhost';

-- A column-level / table-level grant example
GRANT INSERT ON music_label_db.royalties TO 'label_viewer'@'localhost';

FLUSH PRIVILEGES;


SHOW GRANTS FOR 'label_admin'@'localhost';
SHOW GRANTS FOR 'label_app'@'localhost';
SHOW GRANTS FOR 'label_viewer'@'localhost';


REVOKE INSERT ON music_label_db.royalties FROM 'label_viewer'@'localhost';
REVOKE DELETE ON music_label_db.*         FROM 'label_app'@'localhost';
SHOW GRANTS FOR 'label_viewer'@'localhost';
SHOW GRANTS FOR 'label_app'@'localhost';

GRANT DELETE ON music_label_db.* TO 'label_app'@'localhost';



SELECT user, host FROM mysql.user WHERE user LIKE 'label_%';
ALTER USER 'label_viewer'@'localhost' IDENTIFIED BY 'View@456';

