import sql from "k6/x/sql";
import driver from "k6/x/sql/driver/oracle";

const db = sql.open(driver, "oracle://system:mypassword@localhost:1521/FREEPDB1");

export function setup() {
  db.exec(`
    CREATE TABLE if not exists roster
      (
        id number(10),
        given_name VARCHAR(100) NOT NULL,
        family_name VARCHAR(100) NOT NULL,
        PRIMARY KEY(id)
      )
  `);
}

export function teardown() {
  db.exec('drop table roster purge');
  db.close();
}

export default function () {
  let result = db.exec(`
    INSERT INTO roster
      (id, given_name, family_name)
    VALUES
      (1,'Peter', 'Pan'),
      (2,'Wendy', 'Darling'),
      (3,'Tinker', 'Bell'),
      (4,'James', 'Hook');
  `);
  console.log(`${result.rowsAffected()} rows inserted`);

  let rows = db.query("SELECT * FROM roster WHERE given_name = 'Peter'");
  for (const row of rows) {
    console.log(`${row.family_name}, ${row.given_name}`);
  }
}
