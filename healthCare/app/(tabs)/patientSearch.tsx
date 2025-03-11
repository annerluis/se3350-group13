import Checkbox from 'expo-checkbox'; //need to npx expo install expo-checkbox
import { saveDataOffline } from '../../utils/storage-helper'; //offline data storage
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function TabOneScreen() {
  const [rModalVisible, setRModalVisible] = useState(false);
  const [sModalVisible, setSModalVisible] = useState(false);

  const [dModalVisible, setDModalVisible] = useState(false);

  // button for testing, can remove later 
  const [pModalVisible, setPModalVisible] = useState(false);

  return (
    <View style={styles.container}>
          <Text style={styles.title}>Search Patients</Text>
    

          {/* button to open 'Show Patients' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setPModalVisible(true)}>
            <Text style={styles.addButtonText}>Show Patients</Text>
          </TouchableOpacity>

          {/* button to open 'Search for Patient Data' modal */}
          <TouchableOpacity style={styles.addButton} onPress={() => setDModalVisible(true)}>
          <Text style={styles.addButtonText}>Search for Patient Data</Text>
          </TouchableOpacity>

          {/* Show Patients Modal */}
          <Modal visible={pModalVisible} animationType="slide" transparent={true}>
            <ShowPatientScreen onClose={() => setPModalVisible(false)} />
          </Modal>

          {/* Patient Data Modal */}
          <Modal visible={dModalVisible} animationType="slide" transparent={true}>
          <SearchPatientByDemographic onClose={() => setDModalVisible(false)} />
          </Modal>
    
        </View>
  );
}



// function for searching for patients by demographic
function SearchPatientByDemographic({ onClose }: { onClose: () => void }) {
  
  const [demographic, setDemographic] = useState('');
  const [value, setValue] = useState('');

  const handleSearch = async () => {
    if(demographic !== "village" && demographic !== "region" && demographic !== "geolocation"){
      return alert("Must search by one of the specified parameters.");
    }

    if(!value.trim()){
      return alert("Enter characters or words to search by.");
    }

    const reqbody = { demographic, value };

    // make call to backend get method, then display all users
    try {
      const response = await apiClient.post('/GetPatientData', reqbody);
      
      // Extract data from response
      const data = response.data;
  
      // Log the retrieved patient data
      console.log("Retrieved Patient Data:", data);
  

      // if no patients match the request, display a "no patient matches search criteria" message 
      if (data.length === 0) {
        Alert.alert("No Results", "No patient matches the search criteria.");

        alert(`No patients found matching the search description.`);
      } else {
        Alert.alert("Patients Found", JSON.stringify(data, null, 2));

        // for testing on PC
        alert(`Patients Found: ${JSON.stringify(data)}`);
      }

      // if API call was successful, clear fields 
      setDemographic('');
      setValue('');
  
    } catch (error) {
      console.warn("Offline mode: Cannot perform search for patient data.");
      Alert.alert("Offline Mode", "Cannot perform search for patient data.");
    }


    //onClose();
  };

  /* for now, use a textbox, but replace with a dropdown eventually for more ease of use */

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Search for Patient Data</Text>

        

        <TextInput style={styles.input} placeholder="Search by village, region, or geolocation..." placeholderTextColor="#555" value={demographic} onChangeText={setDemographic} />
        <TextInput style={styles.input} placeholder="Search for..." placeholderTextColor="#555" value={value} onChangeText={setValue} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 

// Show Patient Modal Component

function ShowPatientScreen({ onClose }: { onClose: () => void }) {
  const [patients, setPatients] = useState<any[]>([]); // used to store patient data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:8080/getallpat"); // works on web, need to change for mobile app
        if (!response.ok) {
          throw new Error("Failed to fetch patient data.");
        }
        const data = await response.json();

        // print data received in API call 
        console.log(data);

        setPatients(data);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // function to retrieve date in the form YYYY-MM-DD 
  const handleDate = (dob) => {
    return new Date(dob).toISOString().split("T")[0];
  }

  // function to retrieve phone number in the form (XXX) XXX XXXX
  const handlePhone = (phone) => {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Patient Data</Text>

        {loading ? (
          <Text>Loading patient data...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView style={styles.patientList}>
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <View key={index} style={styles.patientItem}>
                  <Text>{`Name: ${patient.fname} ${patient.lname}`}</Text>
                  <Text>{`DOB: ${handleDate(patient.dateOfBirth)}`}</Text>
                  <Text>{`Phone: ${handlePhone(patient.phoneNumber)}`}</Text>
                  <Text>{`Email: ${patient.email}`}</Text>
                  <Text>{`Emergency Contact: ${patient.contactPerson}`}</Text>
                  <Text>{`Village: ${patient.village}`}</Text>
                  <Text>{`Region: ${patient.region}`}</Text>
                  <Text>{`National ID: ${patient.nationalIDCard}`}</Text>
                </View>
              ))
            ) : (
              <Text>No patients found.</Text>
            )}
          </ScrollView>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
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
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  patientList: {
    width: "100%",
    maxHeight: 300,
    marginVertical: 10,
  },
  patientItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
});