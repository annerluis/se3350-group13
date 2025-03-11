const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
var bcrypt = require("bcrypt"); // used for password encryption, provides security

app.use(cors());
app.use(express.json());

// establish connection to YugabyteDB
/*const { Pool } = require("pg");

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

// database queries for yugabyte will use pool.query instead of con.query
*/
app.get("/", (req, res) => {
  res.send("Hello from our server!");
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

var mysql = require("mysql2"); //Getting SQL information

var con = mysql.createConnection({
  //Connecting to SQL server hosting
  host: "localhost", //Change to match Yugabyte information later
  user: "root",
  password: "!",
  database: "healthcare_app",
});

con.connect(function (err) {
  //Connecting to nodemonasz
  if (err) throw err;
  console.log("Connected to MySQL.");
});

// query to retrieve all patients (for testing)
app.get("/getall", async (req, res) => {
  try {
    const patientquery = `SELECT * FROM patient`;
    const { rows } = await pool.query(patientquery); // because it is an async method

    // print data to console and return
    console.log(rows);
    res.status(200).json(rows);
  } catch {
    console.error("Error fetching data from 'Patient' table.", error);
    res
      .status(500)
      .json({ error: "Error fetching data from 'Patient' table." });
  }
});

// same function, rewritten for MySQL
app.get("/getallpat", (req, res) => {
  const patientQuery = "SELECT * FROM patientInfo";
  con.query(patientQuery, (error, results) => {
    if (error) {
      console.error("Error fetching data from 'Patient' table.", error);
      return res.status(500).json({ error: "Error fetching data from 'Patient' table." });
    }
    console.log(results);
    res.status(200).json(results);
  });
});

// rewriting patient retrieval function using sql queries
app.post("/GetPatientData", (req, res) => {
  // request body based on some demographic - can be village, region, or geolocation

  // request body is a pair (demographic selection, value)
  const { demographic, value } = req.body;

  const patientQuery = `SELECT * FROM patientInfo WHERE ${demographic} = '${value}';`;

  con.query(patientQuery, (error, results) => {
    if (error) {
      console.log("error occurred while retrieving patient data");

      console.error("Failed to retrieve patient data.", error);
      res.status(500).json({ error: "Failed to retrieve patient data." });
    } else {
      console.log(results); // for debugging
      res.status(201).json(results);
    }
  });
});

// function to add account in YugabyteDB database
app.post("/create", async (req, res) => {
  try {
    const { fname, lname, empid, username, password } = req.body;

    // hash the password before storing, considered a best practice
    //const hashedPassword = await bcrypt.hash(password, 10);

    // query to add a patient to the table in the healthcare_app database
    const addAccountQuery = `
      INSERT INTO account (fname, lname, empid, username, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    // running the query
    const result = await pool.query(addAccountQuery, [
      fname,
      lname,
      empid,
      username,
      password,
    ]);

    res.status(201).json({
      message: "Account created successfully.",
      account: result.rows[0],
    });

    // print account details to console for debugging
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

//User login function using account table
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  //console.log(username);

  const query = `                     
        SELECT accountType
        FROM accounts
        WHERE username LIKE ?
        AND password LIKE ?;
    `;

  con.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Failed to fetch patients by village and/or region", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    } else {
      console.log(results);
      res.status(201).json(results);
    }
  });
});

// login function using mysql, from start screen
app.post("/MainLogin", (req, res) => {
  const { username, password } = req.body;

  const loginquery = `SELECT password FROM accounts WHERE username = ?;`; // form of query used for safety

  con.query(loginquery, [username], async (error, results) => {
    if (error) {
      console.error("Error: Could not perform login.", error);
      return res.status(500).json({ error: "Failed to login." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const storedPassword = results[0].password;

    // use bcrypt to compare password entered and password found in database
    const isMatch = await bcrypt.compare(password, storedPassword);

    // compare passwords, need to implement security later

    /* let isMatch;
    if (password === storedPassword) {
      isMatch = false;
    } else {
      isMatch = true;
    } */

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    console.log("Login successful for:", username);
    res.status(200).json({ message: "Login successful", username });
  });
});

//healthcare provider accounts stored in account table
app.post("/createaccount", async (req, res) => {
  const { username, password, accountType, assignedRegion, accessLevel } =
    req.body;

  // Make sure an account with this username doesn't exist
  const userquery = `SELECT * FROM accounts WHERE username = ?`;

  con.query(userquery, [username], async (error, results) => {
    if (error) {
      console.error("Failed to check username", error);
      return res.status(500).json({ error: "Failed to check username." });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: "Username already in use." });
    }

    try {
      // hash the password before storage, ensure secure data storage
      const hashedPassword = await bcrypt.hash(password, 10);

      const addquery = `
        INSERT INTO accounts (username, password, accountType, assignedRegion, accessLevel)
        VALUES (?, ?, ?, ?, ?)`;

      con.query(
        addquery,
        [username, hashedPassword, accountType, assignedRegion, accessLevel],
        (error, results) => {
          if (error) {
            console.error("Failed to create account", error);
            return res.status(500).json({ error: "Failed to create account." });
          }
          return res
            .status(201)
            .json({ message: "Account created successfully." });
        }
      );
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ error: "Failed to hash password." });
    }
  });
});

//add patient profile - change these fields
app.post("/addPatient", (req, res) => {
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
  const natidquery = `SELECT * FROM patientInfo WHERE nationalIDCard = ?`;

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
        INSERT INTO patientInfo (fname, lname, dateOfBirth, phoneNumber, contactPerson, email, village, region, geolocation, nationalIDCard)
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

//add patient profile
app.post("/addPatientSymptoms", (req, res) => {
  console.log("Request received: ", req.body);

  const {
    natID,
    blurredVision,
    poorNightVision,
    lightSensitivity,
    eyePain,
    burningFeeling,
    redEyes,
    swollenEyelids,
    yellowedEyes,
    wateryEyes,
    bulgingEyes,
  } = req.body;

  //make sure the username is unique - if not, return
  const checkuser = `SELECT * FROM patientInfo WHERE nationalIDCard = ?`;

  con.query(checkuser, [natID], (error, results) => {
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
        natID,
        blurredVision,
        poorNightVision,
        lightSensitivity,
        eyePain,
        burningFeeling,
        redEyes,
        swollenEyelids,
        yellowedEyes,
        wateryEyes,
        bulgingEyes,
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
app.post("/addPatientExam", (req, res) => {
  console.log("Request received: ", req.body);

  const { natID, clinician, eyeProblems, score } = req.body;

  //make sure the username is unique - if not, return
  const checkuser = `SELECT * FROM patientInfo WHERE nationalIDCard = ?`;

  con.query(checkuser, [natID], (error, results) => {
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

    const checkdoctor = `SELECT * FROM accounts WHERE username = ?`;

    con.query(checkdoctor, [natID], (error, results) => {
      if (error) {
        console.error("Error inserting patient:", error);
        return res.status(500).json({ error: "Failed to add patient profile" });
      }

      if ((results.length = 0)) {
        console.log("Clinician profile does not exsist.");
        return res
          .status(500)
          .json({ error: "Clinician profile does not exsist." });
      }

      const query = `
          INSERT INTO patientExam VALUES (
          ?,
          ?,
          ?,
          ?);
      `;

      con.query(
        query,
        [natID, clinician, eyeProblems, score],
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
});

//get patient data from a clinician
app.get("/getDataOfClinician", (req, res) => {
  const clinicianUsername = req.query.username; //get clinician username

  if (!clinicianUsername) {
    return res.status(400).json({ error: "Clinician username is required." });
  }

  const query = `
    SELECT pi.*, ps.*, pe.*
    FROM patientInfo pi
    LEFT JOIN patientSymptoms ps ON pi.nationalIDCard = ps.nationalIDCard
    LEFT JOIN patientExam pe ON pi.nationalIDCard = pe.nationalIDCard
    WHERE pe.clinician = ?;
  `;

  con.query(query, [clinicianUsername], (error, results) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Failed to fetch patient data." });
    }

    //console.log(results.length);

    if ((results.length) == 0) {
      return res
        .status(404)
        .json({ message: "No patient data found for this clinician." });
    }

    res.status(200).json(results);
  });
});

//get aggregated data for admin
app.get("/getAggregatedData", (req, res) => {
  const query = `
    SELECT 
      pi.region,
      COUNT(*) AS total_patients,
      SUM(CASE WHEN ps.bluredVision THEN 1 ELSE 0 END) AS total_blurred_vision,
      SUM(CASE WHEN ps.nightVision THEN 1 ELSE 0 END) AS total_night_vision,
      SUM(CASE WHEN ps.eyePain THEN 1 ELSE 0 END) AS total_eye_pain
    FROM patientInfo pi
    LEFT JOIN patientSymptoms ps ON pi.nationalIDCard = ps.nationalIDCard
    LEFT JOIN patientExam pe ON pi.nationalIDCard = pe.nationalIDCard
    GROUP BY pi.region;

  `;

  con.query(query, (error, results) => {
    if (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch aggregated data." });
    }

    if (results.rows.length === 0) {
      //if no data
      return res
        .status(404)
        .json({ message: "No aggregated data is available!" });
    }

    res.status(200).json(results); //return aggregated data
  });
});
