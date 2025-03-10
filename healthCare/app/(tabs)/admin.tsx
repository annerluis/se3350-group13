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
import { saveDataOffline } from '../../utils/storage-helper';


const apiClient = axios.create({
  baseURL: 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function Admin() {
  const [cModalVisible, setCModalVisible] = useState(false); //create account modal
  const [lModalVisible, setLModalVisible] = useState(false); //login modal 

  return(
  <View style={styles.container}>
    <Text style={styles.title}>
        Welcome to the Admin Page
    </Text>

    {/* button to open the create account modal */}
    <TouchableOpacity style={styles.addButton} onPress={() => setCModalVisible(true)}>
      <Text style={styles.addButtonText}>Create Account</Text>
    </TouchableOpacity>

    {/* create account modal */}
    <Modal visible={cModalVisible} animationType="slide" transparent={true}>
      <CreateAccountScreen onClose={() => setCModalVisible(false)} />
    </Modal>
  </View>
  );
}

//create account modal component 
function CreateAccountScreen({ onClose }: { onClose: () => void }) {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [empID, setEmpID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');

  //can add more fields if needed 

  const handleAccountCreation = async () => {
    //need to add code to add healthcare provider account to database

    if (!fname || !lname || !empID || !username || !password || !cPassword){
      Alert.alert('Error', 'All fields required.');

      return;
    }
    //make sure passwords match 
    if(password !== cPassword){
      Alert.alert('Error', 'Passwords do not match.');

      setPassword('');
      setCPassword('');

      return;
    }
    if (fname.length > 30 || lname.length > 30 || username.length > 30 || password.length > 30 || cPassword.length > 30) {
      Alert.alert('Error', 'Maximum of 30 characters per field.');

      return;
    }

    if (/\d/.test(fname)|| /\d/.test(lname)){
      Alert.alert('Error', 'No numbers in name.');

      return;
    }

    if (/[!-\/:-@[-`{-~]/.test(fname)|| /[!-\/:-@[-`{-~]/.test(lname)){
      Alert.alert('Error', 'No special characters in name.');

      return;
    }

    // add account in YugabyteDB 
    const addAccount = {
      fname,
      lname, 
      empid: empID,
      username,
      password,
    }; 

    try {
      const response = await apiClient.post("/create", addAccount);
      Alert.alert("Success", `Account Registered:\n${response.data.account.username}`);
    } catch (error) {
      // if data cannot be added to the database, store locally 

      /*console.warn("Offline mode: Saving data locally");
      await saveDataOffline(addAccount);
      Alert.alert(
        "Offline Mode",
        "Data saved offline and will sync when online."
      );*/
    }

    //one account per employee ID and username should be unique 
    const accountData = {//hard coded sample data, change later
      username: username,
      password: password,

      accountType: 'Clinic',
      assignedRegion: 'Bihar',
      accessLevel: 2,
    }
    try {
      await apiClient.post('/createaccount', accountData);
      Alert.alert('Success', `Account Registered:\n${username}`);
    } catch (error) {
      console.warn('Offline mode: Saving data locally');
      await saveDataOffline(accountData);
      Alert.alert('Offline Mode', 'Data saved offline and will sync when online.');
    }

    onClose();

  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Create Account</Text>

        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#555" value={fname} onChangeText={setFname} />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#555" value={lname} onChangeText={setLname} />
        <TextInput style={styles.input} placeholder="Employee ID" placeholderTextColor="#555" value={empID} onChangeText={setEmpID} />
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#555" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#555" value={cPassword} onChangeText={setCPassword} secureTextEntry={true} />


        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleAccountCreation}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

//fetch aggregated data modal component
function FetchAggregatedDataScreen({ onClose }: { onClose: () => void }) {
  const [aggregatedData, setAggregatedData] = useState([]);
  const [error, setError] = useState('');

  //fetch aggregated data
  const fetchAggregatedData = async () => {
    setError('');

    try {
      const response = await apiClient.get(`/getAggregatedData`);
      if (response.data.length === 0) {
        setError('No aggregated data found.'); 
      } else {
        setAggregatedData(response.data); //update state with the aggregated data
      }
    } catch (err) {
      console.error('Error fetching aggregated data:', err);
      setError('Failed to fetch aggregated data.');
    }
  };

  const showAggregatedItem = ({ item }) => (
    <View style={styles.aggregatedItem}>
      {/*display aggregated stuff*/}
      <Text style={styles.regionName}>Region: {item.region}</Text>
      <Text>Total Patients: {item.total_patients}</Text>
      <Text>Total Blurred Vision: {item.total_blurred_vision}</Text>
      <Text>Total Night Vision: {item.total_night_vision}</Text>
      <Text>Total Eye Pain: {item.total_eye_pain}</Text>
      <Text>Average Left Eye: {item.avg_left_eye}</Text>
      <Text>Average Right Eye: {item.avg_right_eye}</Text>
    </View>
  );

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Fetch Aggregated Data</Text>

        {/*button to get aggregated data */}
        <TouchableOpacity style={styles.fetchButton} onPress={fetchAggregatedData}>
          <Text style={styles.buttonText}>Fetch Aggregated Data</Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          //display the list of aggregated data
          <FlatList
            data={aggregatedData}
            renderItem={showAggregatedItem}
            keyExtractor={(item) => item.region}
            style={styles.aggregatedList}
          />
        )}

        {/*button to close the modal */}
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
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  aggregatedList: {
    width: '100%',
    marginTop: 15,
  },
  aggregatedItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  regionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
});

//data will be the string we send from our server

