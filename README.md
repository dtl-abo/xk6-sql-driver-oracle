# xk6-sql-driver-oracle

Database driver extension for [xk6-sql](https://github.com/grafana/xk6-sql) k6 extension to support Oracle database using the [go-ora](https://github.com/sijms/go-ora) library.  Created to avoid client library installs needed by this [oracle](https://github.com/stefnedelchevbrady/xk6-sql-with-oracle) implementation (which used [godror](https://github.com/godror/godror).)

## Example

```JavaScript file=examples/example.js
import sql from "k6/x/sql";
import driver from "k6/x/sql/driver/oracle";

// The second argument should be replaced with an Oracle connection string, e.g.
// oracle://sys:password@localhost:1521/ORCL"
const db = sql.open(driver, "<yourdb>");

export function setup() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roster
      (
        id NUMBER(20),
        given_name VARCHAR(100) NOT NULL,
        family_name VARCHAR(100) NOT NULL
      );
  `);
}

export function teardown() {
  db.close();
}

export default function () {
  let result = db.exec(`
    INSERT INTO roster
      (given_name, family_name)
    VALUES
      (1,'Peter', 'Pan'),
      (2,'Wendy', 'Darling'),
      (3,'Tinker', 'Bell'),
      (4,'James', 'Hook');
  `);
  console.log(`${result.rowsAffected()} rows inserted`);

  let rows = db.query("SELECT * FROM roster WHERE given_name = $1;", "Peter");
  for (const row of rows) {
    console.log(`${row.family_name}, ${row.given_name}`);
  }
}
```

## Usage

Check the [xk6-sql documentation](https://github.com/grafana/xk6-sql) on how to use this database driver.
