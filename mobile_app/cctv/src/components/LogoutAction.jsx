import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {auth} from '../configs/Configs';
import {ToastAndroid} from "react-native";
import * as SecureStore from 'expo-secure-store';
//import { ToastAndroid } from 'react-native';

export default function LogoutAction() {
  const navigation = useNavigation();

  function returnToLoginScreen() {
    auth
      .signOut()
      .then(() => {
        ToastAndroid.show("Logged out",  ToastAndroid.SHORT);
        // ToastAndroid.show("Logged out.", ToastAndroid.LONG);
        SecureStore.setItem('userToken', '');
        SecureStore.setItem('userOfficerName', '')
        SecureStore.setItem('userOfficerId', '');
        SecureStore.setItem('userOfficerEmail', '');
        SecureStore.setItem('userOfficerPhone', '');
        SecureStore.setItem('userOfficerRank', '');
        navigation.replace('login');
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  return <Appbar.Action icon='power' onPress={returnToLoginScreen} />;
}
