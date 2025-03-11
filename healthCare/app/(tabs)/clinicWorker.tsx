import Checkbox from 'expo-checkbox'; //need to npx expo install expo-checkbox
import { saveDataOffline } from '../../utils/storage-helper'; //offline storage helper
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/',    //change when we get to deployment, need to have begginning url for 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function TabTwoScreen() {
  const [rModalVisible, setRModalVisible] = useState(false);
  const [sModalVisible, setSModalVisible] = useState(false);
  const [qModalVisible, setQModalVisible] = useState(false);
  const [fModalVisible, setFModalVisible] = useState(false);

  return (
    <View style={styles.container}>
          <Text style={styles.title}>Welcome to the Clinic Page</Text>
    
          {/* button to open 'Patient Registration' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setRModalVisible(true)}>
            <Text style={styles.addButtonText}>Patient Registration</Text>
          </TouchableOpacity>
    
          {/* button to open 'Add Patient Symptoms' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setSModalVisible(true)}>
            <Text style={styles.addButtonText}>Add Patient Symptoms</Text>
          </TouchableOpacity>
    
          {/* button to open 'Health Questionnaire' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setQModalVisible(true)}>
            <Text style={styles.addButtonText}>Complete Questionnaire</Text>
          </TouchableOpacity>
    
          {/* button to open 'Fetch Patient Data' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setFModalVisible(true)}>
            <Text style={styles.addButtonText}>Fetch Patient Data</Text>
          </TouchableOpacity>

          {/* Patient Registration Modal */}
          <Modal visible={rModalVisible} animationType="slide" transparent={true}>
            <PatientRegistrationScreen onClose={() => setRModalVisible(false)} />
          </Modal>
    
          {/* Patient Symptom Modal */}
          <Modal visible={sModalVisible} animationType="slide" transparent={true}>
            <PatientSymptomScreen onClose={() => setSModalVisible(false)} />
          </Modal>
    
          {/* Health Questionnaire Modal */}
          <Modal visible={qModalVisible} animationType="slide" transparent={true}>
            <HealthQuestionnaireScreen onClose={() => setQModalVisible(false)} />
          </Modal>
        
           {/* Health Questionnaire Modal */}
          {<Modal visible={fModalVisible} animationType="slide" transparent={true}>
            <FetchPatientDataScreen onClose={() => setFModalVisible(false)} />
          </Modal>}
    </View>
  );
}

// Patient Registration Modal Component
function PatientRegistrationScreen({ onClose }: { onClose: () => void }) {
  const [fname, setFirstName] = useState('');
  const [lname, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [region, setRegion] = useState('');
  const [geolocation, setGeolocation] = useState('');
  const [natID, setNatID] = useState('');

  const handleRegister = async () => {
    //need to add code to add patient to database

    if (!fname || !lname || !dob || !phone || !contact || !email || !village || !region || !geolocation || !natID) {
      Alert.alert('Error', 'All fields are required for patient registration.');
      return;
    }

    if (fname.length > 30 || lname.length > 30 || email.length > 30 || village.length > 30 || region.length > 30) {
      Alert.alert('Error', 'Maximum of 30 characters per field.');

      return;
    }
    
    if (/\d/.test(fname) || /\d/.test(lname) || /\d/.test(village) || /\d/.test(region)){
      Alert.alert('Error', 'No numbers in name or place.');

      return;
    }

    if (/\d/.test(fname) || /\d/.test(lname) || /\d/.test(village) || /\d/.test(region)){
      Alert.alert('Error', 'No numbers in name or place.');

      return;
    }
    
    if (/[!-\/:-@[-`{-~]/.test(fname)|| /[!-\/:-@[-`{-~]/.test(lname) || /[!-\/:-@[-`{-~]/.test(village) || /[!-\/:-@[-`{-~]/.test(region)){
      Alert.alert('Error', 'No special characters in name or place.');

      return;
    }


    
    //if (!isNaN(new Date(dob))){

    //}

    //check if a patient with this National ID already exists 

    const patientData = {//Change this later to be non- hard coded
      firstName: fname,
      lastName: lname,
      dob: "2022-03-25",
      phone: phone,
      contact: contact,
      email: email,
      village: village,
      region: region,
      geolocation: geolocation,
      natID: natID
    };

    //tries to save data normally, if error will save data offline 
    try {
      await apiClient.post('/addPatient', patientData);
      Alert.alert('Success', `Patient Registered:\n${fname} ${lname}`);
    } catch(error) {
      console.warn('Offline mode: Saving data locally');
      await saveDataOffline(patientData);
      Alert.alert('Offline Mode', 'Data saved offline and will sync when online.');
    }

    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Patient Registration</Text>

        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#555" value={fname} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#555" value={lname} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#555" value={dob} onChangeText={setDob} />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#555" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Contact" placeholderTextColor="#555" value={contact} onChangeText={setContact} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#555" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Village" placeholderTextColor="#555" value={village} onChangeText={setVillage} />
        <TextInput style={styles.input} placeholder="Region" placeholderTextColor="#555" value={region} onChangeText={setRegion} />
        <TextInput style={styles.input} placeholder="Geolocation" placeholderTextColor="#555" value={geolocation} onChangeText={setGeolocation} />
        <TextInput style={styles.input} placeholder="National ID" placeholderTextColor="#555" value={natID} onChangeText={setNatID} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Patient Symptom Modal Component
function PatientSymptomScreen({ onClose }: { onClose: () => void }) {
  const [natID, setNatID] = useState('');
  const [blurredVision, setBlurredVision] = useState(false);
  const [poorNightVision, setPoorNightVision] = useState(false);
  const [lightSensitivity, setLightSensitivity] = useState(false);
  const [eyePain, setEyePain] = useState(false);
  const [burningFeeling, setBurningFeeling] = useState(false);
  const [redEyes, setRedEyes] = useState(false);
  const [swollenEyelids, setSwollenEyelids] = useState(false);
  const [yellowedEyes, setYellowedEyes] = useState(false);
  const [wateryEyes, setWateryEyes] = useState(false);
  const [bulgingEyes, setBulgingEyes] = useState(false);


  const handleAddingSymptoms = () => {
    //need to add code to save symptoms in database 

    if (!natID) {
      Alert.alert('Error', 'National ID is a required field.');
      return;
    }


    apiClient.post('/addPatientSymptoms', { //Change this later to be non- hard coded
      natID: natID,
      blurredVision: blurredVision,
      poorNightVision: poorNightVision,
      lightSensitivity: lightSensitivity,
      eyePain: eyePain,
      burningFeeling: burningFeeling,
      redEyes: redEyes,
      swollenEyelids: swollenEyelids,
      yellowedEyes: yellowedEyes,
      wateryEyes: wateryEyes,
      bulgingEyes: bulgingEyes
    })
    .then(function (response) {
      alert(response.data.message);  //This will give us the account type, and there will be some fucntipon to deal with it
      /**Insert function here that stops the bottom layout from being invsible
       * Also make sure that it only turns on the tabs that are avalible for that account
      */

    })
    .catch(function (error) {
      alert(error + ": error adding patient");
    });

    //Alert.alert('Success', `Symptoms added for patient with National ID: ${natID}`);

    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add Patient Symptoms</Text>

        <TextInput style={styles.input} placeholder="National ID" placeholderTextColor="#555" value={natID} onChangeText={setNatID} />
        
        <View style={styles.checkboxGroup}>
          <View style={styles.checkboxContainer}>
            <Checkbox value={blurredVision} onValueChange={() => setBlurredVision(!blurredVision)} />
            <Text style={styles.checkboxLabel}>Blurred Vision</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={poorNightVision} onValueChange={() => setPoorNightVision(!poorNightVision)} />
            <Text style={styles.checkboxLabel}>Poor Night Vision</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={lightSensitivity} onValueChange={() => setLightSensitivity(!lightSensitivity)} />
            <Text style={styles.checkboxLabel}>Light Sensitivity</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={eyePain} onValueChange={() => setEyePain(!eyePain)} />
            <Text style={styles.checkboxLabel}>Eye Pain Sensitivity</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={burningFeeling} onValueChange={() => setBurningFeeling(!burningFeeling)} />
            <Text style={styles.checkboxLabel}>Burning Feeling</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={redEyes} onValueChange={() => setRedEyes(!redEyes)} />
            <Text style={styles.checkboxLabel}>Red Eyes</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={swollenEyelids} onValueChange={() => setSwollenEyelids(!swollenEyelids)} />
            <Text style={styles.checkboxLabel}>Swollen Eyelids</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={yellowedEyes} onValueChange={() => setYellowedEyes(!yellowedEyes)} />
            <Text style={styles.checkboxLabel}>Yellowed Eyes</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={wateryEyes} onValueChange={() => setWateryEyes(!wateryEyes)} />
            <Text style={styles.checkboxLabel}>Watery Eyes</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox value={bulgingEyes} onValueChange={() => setBulgingEyes(!bulgingEyes)} />
            <Text style={styles.checkboxLabel}>Bulging Eyes</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addSymptomButton} onPress={handleAddingSymptoms}>
            <Text style={styles.buttonText}>Add Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Health Questionnaire Modal Component
function HealthQuestionnaireScreen({ onClose }: { onClose: () => void }) {
  const [natID, setNatID] = useState('');
  const [clinician, setClinician] = useState('');
  const [eyeProblems, setEyeProblems] = useState('');
  const [score, setScore] = useState('');
  

  const handleRegister = () => {
    //need to add code to save questionnaire responses in database 

    if (!natID || !clinician || !eyeProblems || !score) {
      alert('Error: All fields required.');
      return;
    }

    apiClient.post('/addPatientExam', { //Change this later to be non- hard coded
      natID: natID,
      clinician: clinician,
      eyeProblems: eyeProblems,
      score: score,
    })
    .then(function (response) {
      alert(response.data.message);  //This will give us the account type, and there will be some fucntipon to deal with it

    })
    .catch(function (error) {
      alert(error + ": error adding patient");
    });

    alert(`Questionnaire submitted for patient with National ID: ${natID}`);

    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Health Questionnaire</Text>

        <View style={styles.questionnaireContainer}>
          <Text style={styles.questionnaireLabel}>Enter the National ID of the patient:</Text>
          <TextInput style={styles.questionnaireInput} placeholder="National ID" placeholderTextColor="#555" value={natID} onChangeText={setNatID} />

          <Text style={styles.questionnaireLabel}>Enter the doctor seeing to the patient:</Text>
          <TextInput style={styles.questionnaireInput} placeholder="Clinician" placeholderTextColor="#555" value={clinician} onChangeText={setClinician} />

          <Text style={styles.questionnaireLabel}>Do you have any eye problems (e.g., redness, difficulty seeing)?</Text>
          <TextInput style={styles.questionnaireInput} placeholder="Describe any issues..." placeholderTextColor="#555" value={eyeProblems} onChangeText={setEyeProblems} />

          <Text style={styles.questionnaireLabel}>Visual Acuity Score (from machine):</Text>
          <TextInput style={styles.questionnaireInput} placeholder="Enter score..." placeholderTextColor="#555" value={score} onChangeText={setScore} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitQuestionnaireButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Fetch Patient Data Modal Component
function FetchPatientDataScreen({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [patientData, setPatientData] = useState([]);
  const [error, setError] = useState('');

  //get patient data using api
  const fetchPatientData = async () => {
    if (!username) { //we're entering a username for now, will change this later
      setError('Enter a clinician username.'); 
      return;
    }
    setError('');

    try {
      const response = await apiClient.get(`/getDataOfClinician?username=${username}`);
      console.log(response);
      if ((response.data.length) == 0) {
        setError('No patient data found for this clinician.'); 
      } else {
        setPatientData(response.data); //update state with the patient data
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to fetch patient data. Please try again.');
    }
  };

    const showPatientItem = ({ item }) => (
      <View style={styles.patientItem}>
        {/*display patient details */}
        <Text style={styles.patientName}>{item.fname} {item.lname}</Text>
        <Text>Date of Birth: {item.dateOfBirth}</Text>
        <Text>Phone: {item.phoneNumber}</Text>
        <Text>Email: {item.email}</Text>
        <Text>Region: {item.region}</Text>
        <Text>Symptoms:</Text>
        <Text> - Blurred Vision: {item.bluredVision ? 'Yes' : 'No'}</Text>
        <Text> - Night Vision: {item.nightVision ? 'Yes' : 'No'}</Text>
        <Text> - Eye Pain: {item.eyePain ? 'Yes' : 'No'}</Text>
        <Text>Exam Results:</Text>
        <Text> - Left Eye: {item.leftEye}</Text>
        <Text> - Right Eye: {item.rightEye}</Text>
      </View>
    );
  
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Fetch Patient Data</Text>
  
          {/*input field for username */}
          <TextInput
            style={styles.input}
            placeholder="Enter clinician username"
            value={username}
            onChangeText={setUsername} //update username state as the user types
          />
  
          {/*button to get patient data */}
          <TouchableOpacity style={styles.fetchButton} onPress={fetchPatientData}>
            <Text style={styles.buttonText}>Fetch Data</Text>
          </TouchableOpacity>
  
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            //display the list of patients
            <FlatList
              data={patientData}
              renderItem={showPatientItem}
              keyExtractor={(item) => item.nationalIDCard}
              style={styles.patientList}
            />
          )}
  
          {/* Button to close the modal */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#00796B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 10,
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  addSymptomButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  submitQuestionnaireButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    margin: 8
  },
  checkboxContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 6, 
    width: '100%', 
    paddingLeft: 10, 
  },
  checkboxLabel: {
    fontSize: 16, 
    marginLeft: 8, 
    color: '#333', 
  },
  checkboxGroup: {
    width: '100%',
    marginTop: 15, 
    marginBottom: 20, 
  },
  questionnaireContainer: {
    alignItems: 'flex-start', 
    width: '100%', 
    paddingHorizontal: 10, 
    marginTop: 15, 
    marginBottom: 20, 
  },
  questionnaireLabel: {
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5, 
  },
  questionnaireInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    marginBottom: 15, 
  },
  fetchButton: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  patientItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  patientName: {
  },
  patientList: {
    width: '100%',
    marginTop: 10,
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
  
});