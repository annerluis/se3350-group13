document.getElementById("infoSearch").addEventListener("click", function (event) {
    //Adding event listener to look for button presses
    var nameSearch = document.getElementById("nameInput").value;
    var villageSearch = document.getElementById("villageInput").value; //Getting the values of village and region
    var regionSearch = document.getElementById("regionInput").value;

    validateSearch(villageSearch); //Making sure that both of these are valid searches
    validateSearch(regionSearch);
    validateSearch(nameSearch);

    searchPatientInfo(nameSearch, villageSearch, regionSearch);
  });

document.getElementById("symptomsSearch").addEventListener("click", function (event) {
    //Adding event listener to look for button presses
    var symptomValue = document.getElementById("symptomDropdown").value;

    searchPatientSymptoms(symptomValue);
  });

function searchPatientInfo(nameSearch, villageSearch, regionSearch) {
  //This allows a person to search all places

  fetch(`/api/usersearch/${nameSearch}/${villageSearch}/${regionSearch}`, {
    method: "GET",
    headers: { "Content-type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        res
          .json()
          .then((data) => {
            displayPatients(data);
          }) //Calling to display all of the lists
          .catch((err) => console.log("Failed to get json object"));
      } else {
        console.log("Error: ", res.status);
      }
    })
    .catch();
}

function searchPatientSymptoms(symptomValue) {
  //This allows a person to search all places
  console.log(symptomValue);

  fetch(`/api/symptomsearch/${symptomValue}`, {
    method: "GET",
    headers: { "Content-type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        res
          .json()
          .then((data) => {
            displayPatients(data);
          }) //Calling to display all of the lists
          .catch((err) => console.log("Failed to get json object"));
      } else {
        console.log("Error: ", res.status);
      }
    })
    .catch();
}

function displayPatients(patients) {
  console.log(patients);
}

function validateSearch(search) {
  //Make a better version
  if (search.length > 20) {
    //If the text string is longer than 20 characters
    alert("ERROR: keep search result less than 20 character");
    return false; //Exit function
  }
  if (/\d/.test(search)) {
    //If the text string contains a number
    alert("ERROR: no numbers in search result");
    return false; //Exit function
  }
  if (/[!-\/:-@[-`{-~]/.test(search)) {
    //If the text contains special characters
    alert("ERROR: no special characters in search result");
    return false;
  }
  return true; //This means that the search result is only letters and is shorter than 21 characters
}


//code for patient profile creation
const modal = document.getElementById("create-patient-modal");
const openModalBtn = document.getElementById("create-patient-btn");
const closeModalBtn = document.getElementById("close-btn");
const createBtn = document.getElementById("create-btn");

//on button click, show modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

//on button click, close modal
closeModalBtn.addEventListener("click", () => {
  //clear all fields when modal is closed
  document.getElementById("patient-user").value = "";
  document.getElementById("patient-pass").value = "";
  document.getElementById("patient-cpass").value = "";

  modal.style.display = "none";
});

//handle profile creation when create button is clicked
createBtn.addEventListener("click", () => {
  //retrieve value from fields, then clear fields
  //check is username is unique and check if passwords match

  const user = document.getElementById("patient-user").value;
  const pass = document.getElementById("patient-pass").value;
  const cpass = document.getElementById("patient-cpass").value;
  const type = document.getElementById("account-type-dropdown").value;

  if (!user || !pass || !cpass) {
    alert("All fields required.");
  }

  if (pass !== cpass) {
    alert("Passwords must match. Please try again.");
    document.getElementById("patient-pass").value = "";
    document.getElementById("patient-cpass").value = "";
    return;
  }

  const addpatient = {
    user,
    pass,
    type
  };

  fetch("/api/addPatient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addpatient),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);

        //clear all fields
        document.getElementById("patient-user").value = "";
        document.getElementById("patient-pass").value = "";
        document.getElementById("patient-cpass").value = "";
      } else {
        alert("Patient profile created successfully.");

        //clear all fields, then close modal
        document.getElementById("patient-user").value = "";
        document.getElementById("patient-pass").value = "";
        document.getElementById("patient-cpass").value = "";

        modal.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while adding the patient.");
    });
});

//code for patient info collection
const infoModal = document.getElementById("create-patient-info-modal");
const openInfoModalBtn = document.getElementById("add-patient-info-btn");
const closeInfoModalBtn = document.getElementById("close-info-btn");
const createInfoBtn = document.getElementById("add-info-btn");

//on button click, show modal
openInfoModalBtn.addEventListener("click", () => {
  infoModal.style.display = "block";

  //load current user
  console.log("current user: ", localStorage.getItem("currentuser"));

  const username = localStorage.getItem("currentuser");

  //retrieve current patient information, load fields if applicable
  fetch("/api/loadPatientInfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("patient data retrieved: ", data);
    })
    .catch((error) =>
      console.error("Error loading patient info:", error.message)
    );

  //update ui fields based on retrieved data
  document.getElementById("patient-info-user").value = username;
});

//on button click, close modal
closeInfoModalBtn.addEventListener("click", () => {
  //clear all fields when modal is closed
  document.getElementById("patient-info-user").value = "";
  document.getElementById("patient-fname").value = "";
  document.getElementById("patient-lname").value = "";
  document.getElementById("patient-dob").value = "";

  document.getElementById("patient-phone").value = "";
  document.getElementById("patient-contact").value = "";
  document.getElementById("patient-email").value = "";

  document.getElementById("patient-info-vilage").value = "";
  document.getElementById("patient-info-region").value = "";
  document.getElementById("patient-geo").value = "";

  document.getElementById("patient-info-natID").value = "";

  infoModal.style.display = "none";
});

//handle profile creation when create button is clicked
createInfoBtn.addEventListener("click", () => {
  //retrieve value from fields, then clear fields
  //check is username is unique and check if passwords match

  const user = document.getElementById("patient-info-user").value;
  const fname = document.getElementById("patient-fname").value;
  const lname = document.getElementById("patient-lname").value;
  const dob = document.getElementById("patient-dob").value;

  const phone = document.getElementById("patient-phone").value;
  const contact = document.getElementById("patient-contact").value;
  const email = document.getElementById("patient-email").value;

  const village = document.getElementById("patient-info-vilage").value;
  const region = document.getElementById("patient-info-region").value;
  const geo = document.getElementById("patient-geo").value;

  const natID = document.getElementById("patient-info-natID").value;

  if (!fname || !lname || !user || !dob || !contact || !village || !region || !natID) {
    alert("Username, first name, and last name are all required.");
    return;
  }

  const addpatient = {
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
  };

  fetch("/api/addPatientInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addpatient),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);

        //clear all fields
        document.getElementById("patient-info-user").value = "";
        document.getElementById("patient-fname").value = "";
        document.getElementById("patient-lname").value = "";
        document.getElementById("patient-dob").value = "";

        document.getElementById("patient-phone").value = "";
        document.getElementById("patient-contact").value = "";
        document.getElementById("patient-email").value = "";

        document.getElementById("patient-info-vilage").value = "";
        document.getElementById("patient-info-region").value = "";
        document.getElementById("patient-geo").value = "";

        document.getElementById("patient-info-natID").value = "";
      } else {
        alert("Patient profile created successfully.");

        //clear all fields, then close modal
        document.getElementById("patient-info-user").value = "";
        document.getElementById("patient-fname").value = "";
        document.getElementById("patient-lname").value = "";
        document.getElementById("patient-dob").value = "";

        document.getElementById("patient-phone").value = "";
        document.getElementById("patient-contact").value = "";
        document.getElementById("patient-email").value = "";

        document.getElementById("patient-info-vilage").value = "";
        document.getElementById("patient-info-region").value = "";
        document.getElementById("patient-geo").value = "";

        document.getElementById("patient-info-natID").value = "";

        modal.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while adding the patient.");
    });
});

//code for patient info collection
const symptomsModal = document.getElementById("add-patient-symptoms-modal");
const openSymptomsModalBtn = document.getElementById("add-patient-sypmtoms-btn");
const closeSymptomsModalBtn = document.getElementById("close-symptoms-btn");
const createSymptomsBtn = document.getElementById("create-symptoms-btn");

//on button click, show modal
openSymptomsModalBtn.addEventListener("click", () => {
  symptomsModal.style.display = "block";
});

//on button click, close modal
closeSymptomsModalBtn.addEventListener("click", () => {
  //clear all fields when modal is closed
  document.getElementById("patient-symptoms-user").value = "";

  document.getElementById("blured-vision-check").checked = false;
  document.getElementById("night-vision-check").checked = false;
  document.getElementById("light-sensitivity-check").checked = false;

  document.getElementById("eye-pain-check").checked = false;
  document.getElementById("burning-check").checked = false;

  document.getElementById("red-eyes-check").checked = false;
  document.getElementById("eyelid-swelling-check").checked = false;
  document.getElementById("yellow-eyes-check").checked = false;
  document.getElementById("watery-eyes-check").checked = false;
  document.getElementById("buldging-eyes-check").checked = false;

  symptomsModal.style.display = "none";
});

//handle profile creation when create button is clicked
createSymptomsBtn.addEventListener("click", () => {
  //retrieve value from fields, then clear fields
  //check is username is unique and check if passwords match

  const user = document.getElementById("patient-symptoms-user").value;
  const bluredVis = document.getElementById("blured-vision-check").checked;
  const nightVis = document.getElementById("night-vision-check").checked;
  const lightSen = document.getElementById("light-sensitivity-check").checked;

  const eyePain = document.getElementById("eye-pain-check").checked;
  const burning = document.getElementById("burning-check").checked;

  const redEyes = document.getElementById("red-eyes-check").checked;
  const eyelidSwell = document.getElementById("eyelid-swelling-check").checked;
  const yellowEyes = document.getElementById("yellow-eyes-check").checked;
  const wateryEyes = document.getElementById("watery-eyes-check").checked;
  const buldgingEyes = document.getElementById("buldging-eyes-check").checked;

  if (!user) {
    alert("Username is required.");
    return;
  }

  const addpatient = {
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
  };

  fetch("/api/addPatientSymptoms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addpatient),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);

        //clear all fields
        document.getElementById("patient-symptoms-user").value = "";

        document.getElementById("blured-vision-check").checked = false;
        document.getElementById("night-vision-check").checked = false;
        document.getElementById("light-sensitivity-check").checked = false;

        document.getElementById("eye-pain-check").checked = false;
        document.getElementById("burning-check").checked = false;

        document.getElementById("red-eyes-check").checked = false;
        document.getElementById("eyelid-swelling-check").checked = false;
        document.getElementById("yellow-eyes-check").checked = false;
        document.getElementById("watery-eyes-check").checked = false;
        document.getElementById("buldging-eyes-check").checked = false;
      } else {
        alert("Patient profile created successfully.");

        //clear all fields, then close modal
        document.getElementById("patient-symptoms-user").value = "";

        document.getElementById("blured-vision-check").checked = false;
        document.getElementById("night-vision-check").checked = false;
        document.getElementById("light-sensitivity-check").checked = false;

        document.getElementById("eye-pain-check").checked = false;
        document.getElementById("burning-check").checked = false;

        document.getElementById("red-eyes-check").checked = false;
        document.getElementById("eyelid-swelling-check").checked = false;
        document.getElementById("yellow-eyes-check").checked = false;
        document.getElementById("watery-eyes-check").checked = false;
        document.getElementById("buldging-eyes-check").checked = false;

        modal.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while adding the patient.");
    });
});

//adding code for login
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const closeLoginBtn = document.getElementById("close-login-btn");
const submitLoginBtn = document.getElementById("submit-login-btn");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
});

closeLoginBtn.addEventListener("click", () => {
  //clear fields and close modal
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";

  loginModal.style.display = "none";
});

//process username and password entered - if login credentials are correct, login and display health questionnaire
submitLoginBtn.addEventListener("click", () => {
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  //Calling for api user login function
  login(user, pass);
});

function login(user, pass) {
  /**This is a very reduementery way of cheking if the account exsists
   * We still need a way to encrypt this information, in both in initial account creation
   * and in the sending of login information
   */

  //Adding the entered username and password to the body
  var accountIdentifiers = {
    username: user,
    password: pass,
  };

  //Calling for api login
  fetch('/api/login', {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify(accountIdentifiers)
  })
    .then((res) => {
      if (!res.ok) {
        console.log("Error: ", res.status);
        return Promise.reject("Login failed.");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data); //check output
      checkLoginType(data);

      //clear fields and close login modal
      document.getElementById("login-user").value = "";
      document.getElementById("login-pass").value = "";

      loginModal.style.display = "none";

      //remove login button, add logout button
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("logout-btn").style.display = "block";

      //information of currently logged in user
      localStorage.setItem("currentuser", data[0].username);
      console.log(localStorage.getItem("currentuser"));
    })
    .catch((err) => console.log("Failed to login:", err));
}

function logout() {
  
  document.getElementById("authorized-login").style.display = "none";
  document.getElementById("authorized-login-admin").style.display = "none";
  document.getElementById("authorized-login-clinic").style.display = "none";

  //make login button visible, make logout button invisible
  document.getElementById("login-btn").style.display = "block";
  document.getElementById("logout-btn").style.display = "none";
}

//add event handler for the logout button
const logoutBtn = document.getElementById("logout-btn");

//this function isn't complete
logoutBtn.addEventListener("click", () => {
  logout();
});

function checkLoginType(account) {
  if (account.length == 0) {
    return;
  }

  document.getElementById("authorized-login").style.display = "block";

  if (account[0].accountType == "Admin") {
    document.getElementById("authorized-login-admin").style.display = "block";
  }
  else if (account[0].accountType == "Clinic"){
    document.getElementById("authorized-login-clinic").style.display = "block";
  }
}

//adding code for questionnaire
const qModal = document.getElementById("q-modal");
const qBtn = document.getElementById("q-btn");
const closeQBtn = document.getElementById("close-q-btn");
const submitQBtn = document.getElementById("submit-q-btn");

qBtn.addEventListener("click", () => {
  qModal.style.display = "block";
});

closeQBtn.addEventListener("click", () => {
  qModal.style.display = "none";
});

submitQBtn.addEventListener("click", () => {
  submitQuestionnaire();
})

function validateQuestionnaire() {
  const patientData = collectQuestionnaireData();
  /*if (/*validate data here){
  } else {
    alert("Please fill in all required fields.");
  }
  */
}

function collectQuestionnaireData() {
  return {
    examInformation: collectExamInfo(),
    testInformation: collectTestInfo(),
    planOfCare: collectPlanOfCare(),
  };
}

function collectExamInfo() {
  return {
    //return exam info later
  };
}

function collectTestInfo() {
  return {
    // return test info later
  };
}

function collectPlanOfCare() {
  return {
    //return a list of diseases and their severity later
  }
}


function submitQuestionnaire(patientData) {
  fetch('/api/questionnaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  })
    .then(res => {
      if (res.ok) {
        alert("Questionnaire submitted successfully");
        closeModal();
      } else {
        console.log('Submission Error:', res.status);
      }
    })
    .catch(error => console.error("Error:", error));
}