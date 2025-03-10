import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const STORAGE_KEY = 'offlineData';

//saving data locally
export const saveDataOffline = async (data) => {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const storedData = existingData ? JSON.parse(existingData) : [];
      storedData.push(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
      console.log('Data saved offline');
    } catch (error) {
      console.error('Error saving data offline:', error);
    }
  };

//sync data while online
export const syncData = async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return; // Exit if offline
  
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storedData) return;
  
      const parsedData = JSON.parse(storedData);
      for (const item of parsedData) {
        await axios.post('http://localhost:8080/sync', item);
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

//check connectivity
export const monitorNetwork = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncData();
      }
    });
  };