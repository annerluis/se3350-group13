import Checkbox from 'expo-checkbox'; //need to npx expo install expo-checkbox

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
} from 'react-native';

let userLogout = 'true';


//We don't need to worry about this right now, could be used for account information later

export default function MainScreen() {
  const [lModalVisible, setLModalVisible] = useState(false); //login modal 
  

  return (
    <>
    </>
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
});