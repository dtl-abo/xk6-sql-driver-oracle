import sql from "k6/x/sql";
import driver from "k6/x/sql/driver/oracle";
import { check } from 'k6';

import { randomString, randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Set options so that 100 VUs each execute one iteration
export let options = {
  vus: 100,
  iterations: 1000,
};

// Open a connection to oracle 
const db = sql.open(driver, "oracle://system:mypassword@localhost:1521/FREEPDB1");

export function setup() {
    // We want this task to be able to run multiple instances without worrying about the table disappearing
    const randomname = randomString(10);
    
  // Create a table with four columns if it doesn't exist.
  // In this example, we use:
  //   - id: an auto-increment primary key (not inserted by the test)
  //   - col1: TEXT
  //   - col2: INTEGER
  //   - col3: REAL
  //   - col4: TEXT
  db.exec(`
    CREATE TABLE if not exists testtable
    (
      id number generated always as identity not null primary key,
      col1 varchar(100),
      col2 INT,
      col3 REAL,
      col4 varchar(100)
    )
  `);
//   db.exec(createTableQuery);
}

export default function () {
  // Generate random data for each column:
  const col1 = randomString(10);            // random 10-character string
  const col2 = randomIntBetween(1, 1000);     // random integer between 1 and 1000
  const col3 = Math.random();                 // random floating number between 0 and 1
  const col4 = randomString(5);               // random 5-character string

  // Insert the random values into the table
  const insertQuery = `
    INSERT INTO testtable(col1, col2, col3, col4)
    VALUES (:1, :2, :3, :4)
  `;
  let res = db.exec(insertQuery, col1, col2, col3, col4);
//   console.log(`${res.rowsAffected()} rows inserted`);


  // Check to ensure the insert worked
  check(res, {
    "inserts succeeded": (r) => r && r.rowsAffected,
  });
}

export function teardown() {
  // Close the database connection (if needed)
  db.exec('drop table testtable purge');
  db.close();
}