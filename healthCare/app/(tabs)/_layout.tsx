import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { monitorNetwork } from '../../utils/storage-helper'; // checks for network connection
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

var userToken = false;

export { userToken };

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [lModalVisible, setLModalVisible] = useState(false); //login modal 
  const [cModalVisible, setCModalVisible] = useState(false); //create account modal
  

  useEffect(() => {
    monitorNetwork();
  });
  
  return (
    <>
      {userToken == false ? (
        // No token found, user isn't signed in
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to the HealthCare App</Text>
        
            {/* button to open the login modal */}
            <TouchableOpacity style={styles.addButton} onPress={() => setLModalVisible(true)}>
              <Text style={styles.addButtonText}>Login</Text>
            </TouchableOpacity>
            
            {/* login modal */}
            <Modal visible={lModalVisible} animationType="slide" transparent={true}>
              <LoginScreen onClose={() => setLModalVisible(false)} />
            </Modal>
        </View>
      ) : (
        // User is signed in
      <>
     
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {position: 'absolute'},
          }),
        }}>
        <Tabs.Screen
          name="patientSearch"
          options={{
            title: 'Patient Search',
          }}
        />
        <Tabs.Screen
          name="clinicWorker"
          options={{
            title: 'Clinic Access',
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin Access',
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Account',
            href: null,
          }}
        />
      </Tabs>

      <TouchableOpacity style={styles.addButton} onPress={() => setCModalVisible(true)}>
        <Text style={styles.addButtonText}>Logout</Text>
      </TouchableOpacity>
  
      {/* create account modal */}
      <Modal visible={cModalVisible} animationType="slide" transparent={true}>
        <CreateAccountScreen onClose={() => setCModalVisible(false)} />
      </Modal>
      </>
      )}
    </>
  );
}

//login modal component 
function LoginScreen({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    try {
      await apiClient.post('/login', { //Change this later to be non- hard coded
        username: username,
        password: password
      })
      .then(function (response) {
        userToken = true;
      })
      .catch(function (error) {
        console.log(error);
        userToken = false;
      });
    } catch (error) {
      userToken = false;
    }
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Patient Registration</Text>

        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#555" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry={true} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


function CreateAccountScreen({ onClose }: { onClose: () => void }) {

  const handleAccountCreation = async () => {
    userToken = false;

    onClose();

  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Confirm logout</Text>
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleAccountCreation}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
});