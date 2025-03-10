CREATE DATABASE healthcare_app;

USE healthcare_app;

CREATE TABLE accounts (
    username VARCHAR(30) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,

    accountType VARCHAR(20),
    assignedRegion VARCHAR(50),
    accessLevel INT,

    CONSTRAINT chk_accountType CHECK (accountType IN ('Clinic', 'Admin'))
);

CREATE TABLE patientInfo (
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    dateOfBirth DATE NOT NULL,

    phoneNumber VARCHAR(15),
    contactPerson VARCHAR(50) NOT NULL,
    email VARCHAR(50),

    village VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    geolocation VARCHAR(30),

    nationalIDCard VARCHAR(16) NOT NULL PRIMARY KEY
);

CREATE TABLE patientSymptoms (
    nationalIDCard VARCHAR(30) NOT NULL PRIMARY KEY,

    bluredVision BOOLEAN DEFAULT 0,
    nightVision BOOLEAN DEFAULT 0,
    lightSeneitivity BOOLEAN DEFAULT 0,

    eyePain BOOLEAN DEFAULT 0,
    burning BOOLEAN DEFAULT 0,

    redEyes BOOLEAN DEFAULT 0,
    eyelidSwelling BOOLEAN DEFAULT 0,
    buldgingEyes BOOLEAN DEFAULT 0,
    yellowEyes BOOLEAN DEFAULT 0,
    wateryEyes BOOLEAN DEFAULT 0,

    FOREIGN KEY (nationalIDCard) REFERENCES patientInfo(nationalIDCard)
);

CREATE TABLE patientExam (
    nationalIDCard VARCHAR(30),
    clinician VARCHAR(30),

    eyeProblems INT,
    eyeScore INT,

    
    FOREIGN KEY (nationalIDCard) REFERENCES patientInfo(nationalIDCard),
    FOREIGN KEY (clinician) REFERENCES accounts(username)
);

CREATE TABLE patientCare (
    username VARCHAR(30),

    
    FOREIGN KEY (username) REFERENCES accounts(username)
);

