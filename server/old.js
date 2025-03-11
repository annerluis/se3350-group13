var mysql = require("mysql2"); //Getting SQL information

const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var con = mysql.createConnection({
  //Connecting to SQL server hosting
  host: "localhost", //Change to match Yugabyte information later
  user: "root",
  password: "Sql4ame!",
  database: "healthcare_app",
});

con.connect(function (err) {
  //Connecting to nodemon
  if (err) throw err;
  console.log("Connected!");
});

// establishing connection for YugabyteDB, will need to npm install pg
const { Pool } = require("pg");

//api stuff begins
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
var salt = bcrypt.genSaltSync(10);

// database connection configuration
const pool = new Pool({
  user: "yugabyte",
  host: "localhost",
  database: "healthcare_app",
  password: "yugabyte",
  port: 5433,
});

// test connection to yugabyte database
pool
  .connect()
  .then((client) => {
    console.log("Connected to YugabyteDB.");
    client.release();
  })
  .catch((err) => console.log("Database connection error.", err.stack));

//adding middleware to parse request bodies
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "..", "client")));
const router = express.Router();
router.use(express.json());

//middleware for logging
app.use((req, res, next) => {
  //for all routes
  console.log(`${req.method} request for ${req.url}`);
  next();
});


// the following methods will need to be changed, connected to yugabyte instead of mysql

//Searching through database for client
app.get("/api/usersearch/:name/:village/:region", (req, res) => {
  const { name, village, region } = req.params;

  console.log(name, village, region);

  //Change the queary to fit the current requirements
  const query = `                     
        SELECT *
        FROM patientInfo
        WHERE fname LIKE ?
        OR lname LIKE ?
        OR village LIKE ?
        OR region LIKE ?;
    `;

  con.query(query, [name, name, village, region], (error, results) => {
    if (error) {
      console.error("Failed to fetch patients by village and/or region", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    } else {
      console.log(results);
      res.status(200).json(results);
    }
  });
});

//Ways to search patients that have a certain sysmptons
app.get("/api/symptomsearch/:symptom", (req, res) => {
  const { symptom } = req.params;

  //Change the queary to fit the current requirements
  const query = `                     
        SELECT *
        FROM patientSymptoms
        WHERE ? = TRUE;
    `;

  con.query(query, [symptom], (error, results) => {
    if (error) {
      console.error("Failed to fetch patients by symptoms", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    } else {
      res.status(200).json(results);
    }
  });
});

//healthcare provider accounts stored in account table
app.post("/api/createaccount", (req, res) => {
  const { fname, lname, empID, username, password } = req.body;

  //make sure an account with this employee ID doesn't exist
  const empquery = `SELECT * FROM account WHERE empID = ?`;

  con.query(empquery, [empID], (error, results) => {
    if (error) {
      console.error("Failed to check employee ID", error);
      return res.status(500).json({ error: "Failed to check employee ID." });
    } else {
      if (results.length > 0) {
        return res.status(400).json({ error: "Employee ID in use." });
      }

      const userquery = `SELECT * FROM account WHERE username = ?`;

      con.query(userquery, [username], (error, results) => {
        if (error) {
          console.error("Failed to check username", error);
          return res.status(500).json({ error: "Failed to check username." });
        }
        if (results.length > 0) {
          return res.status(400).json({ error: "Username in use." });
        }

        const addquery = `INSERT INTO account (fname, lname, empID, username, password) VALUES (?, ?, ?, ?, ?)`;

        con.query(
          addquery,
          [fname, lname, empID, username, password],
          (error, results) => {
            if (error) {
              console.error("Failed to create account", error);
              return res
                .status(500)
                .json({ error: "Failed to create account." });
            }
            return res
              .status(201)
              .json({ message: "Account created successfully." });
          }
        );
      });
    }
  });
});

//User login function using account table
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Login credentials: ", req.body);

  const userquery = `                     
        SELECT password
        FROM account
        WHERE username = ?
    `;

  con.query(userquery, [username], (error, results) => {
    if (error) {
      console.error("Failed to login", error);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    } else {
      if (results.length === 0) {
        console.error("Account with this username could not be found", error);
        return res
          .status(500)
          .json({ error: "Account with this username not found." });
      }

      if (results[0].password !== password) {
        console.error("Incorrect password", error);
        return res.status(500).json({ error: "Incorrect password." });
      }
      return res.status(200).json({ message: "Logged in successfully." });
    }
  });
});

//add patient profile - change these fields
app.post("/api/addPatient", (req, res) => {
  console.log("Request received: ", req.body);

  const {
    firstName,
    lastName,
    dob,
    phone,
    contact,
    email,
    village,
    region,
    geolocation,
    natID,
  } = req.body;

  //make sure the national ID is unique
  const natidquery = `SELECT * FROM patient WHERE natID = ?`;

  con.query(natidquery, [natID], (error, results) => {
    if (error) {
      console.error("Error checking National ID:", error);
      return res.status(500).json({ error: "Failed to check National ID." });
    }

    if (results.length > 0) {
      console.log("Patient with this National ID already in the system.");
      return res.status(500).json({
        error: "Patient with this National ID already in the system.",
      });
    }

    const addquery = `
        INSERT INTO patient (firstName, lastName, dob, phone, contact, email, village, region, geolocation, natID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    con.query(
      addquery,
      [
        firstName,
        lastName,
        dob,
        phone,
        contact,
        email,
        village,
        region,
        geolocation,
        natID,
      ],
      (error, results) => {
        if (error) {
          console.error("Error adding patient:", error);
          return res.status(500).json({
            error: `Failed to add patient with National ID: ${natID}`,
          });
        }

        res.status(201).json({ message: "Patient added successfully." });
      }
    );
  });
});

//load patient info
app.post("/api/loadPatientInfo", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required." });
  }

  const sql = "SELECT * FROM accounts WHERE username = ?";

  con.query(sql, [username], (err, result) => {
    if (err) {
      console.error("Error retrieving patient info:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "There is no account with this username." });
    }

    res.json(result[0]); //return patient info
  });
});

//add patient profile
app.post("/api/addPatientInfo", (req, res) => {
  console.log("Request received: ", req.body);

  const {
    user,
    fname,
    lname,
    dob,
    phone,
    contact,
    email,
    village,
    region,
    geo,
    natID,
  } = req.body;

  //make sure the username is unique - if not, return
  const checkuser = `SELECT * FROM accounts WHERE username = ?`;

  con.query(checkuser, [user], (error, results) => {
    if (error) {
      console.error("Error inserting patient:", error);
      return res.status(500).json({ error: "Failed to add patient profile" });
    }

    if ((results.length = 0)) {
      console.log("Patient profile does not exsist.");
      return res
        .status(500)
        .json({ error: "Patient profile with this username already exists." });
    }

    const query = `
        INSERT INTO patientInfo VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?);
    `;

    con.query(
      query,
      [
        user,
        fname,
        lname,
        dob,
        phone,
        contact,
        email,
        village,
        region,
        geo,
        natID,
      ],
      (error, results) => {
        if (error) {
          console.error("Error inserting patient:", error);
          return res
            .status(500)
            .json({ error: "Failed to add patient profile" });
        }

        res.status(201).json({ message: "Patient added successfully." });
      }
    );
  });
});

//add patient profile
app.post("/api/addPatientSymptoms", (req, res) => {
  console.log("Request received: ", req.body);

  const {
    user,
    bluredVis,
    nightVis,
    lightSen,
    eyePain,
    burning,
    redEyes,
    eyelidSwell,
    yellowEyes,
    wateryEyes,
    buldgingEyes,
  } = req.body;

  //make sure the username is unique - if not, return
  const checkuser = `SELECT * FROM accounts WHERE username = ?`;

  con.query(checkuser, [user], (error, results) => {
    if (error) {
      console.error("Error inserting patient:", error);
      return res.status(500).json({ error: "Failed to add patient profile" });
    }

    if ((results.length = 0)) {
      console.log("Patient profile does not exsist.");
      return res
        .status(500)
        .json({ error: "Patient profile with this username already exists." });
    }

    const query = `
        INSERT INTO patientSymptoms VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?);
    `;

    con.query(
      query,
      [
        user,
        bluredVis,
        nightVis,
        lightSen,
        eyePain,
        burning,
        redEyes,
        eyelidSwell,
        yellowEyes,
        wateryEyes,
        buldgingEyes,
      ],
      (error, results) => {
        if (error) {
          console.error("Error inserting patient:", error);
          return res
            .status(500)
            .json({ error: "Failed to add patient profile" });
        }

        res.status(201).json({ message: "Patient added successfully." });
      }
    );
  });
});

// Starting the server on port 3000,
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});
