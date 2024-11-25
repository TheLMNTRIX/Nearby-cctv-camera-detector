import React, { useRef, useState, useEffect } from 'react';
import { Text, TextInput, Button, useTheme, Dialog, Provider, Portal } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../configs/Configs';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginErrorDialog, setLoginErrorDialog] = useState(false);
  const [loginErrorText, setLoginErrorText] = useState('');
  const loginButtonRef = useRef();
  const passRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to MainScreen
        navigation.replace('PostLogin');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginErrorText('Please enter both email and password.');
      setLoginErrorDialog(true);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's UID securely
      await SecureStore.setItemAsync('userToken', user.uid);

      // Check if the user exists in your Firestore database
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('User not found in the database');
        // You might want to create a new user document here
      } else {
        const userData = querySnapshot.docs[0].data();
        console.log('User data:', userData);
        await SecureStore.setItemAsync('userOfficerName', userData.name)
        await SecureStore.setItemAsync('userOfficerId', userData.officer_id);
        await SecureStore.setItemAsync('userOfficerEmail', userData.email);
        await SecureStore.setItemAsync('userOfficerPhone', userData.phone_number);
        await SecureStore.setItemAsync('userOfficerRank', userData.rank);
      }

      // Navigation to MainScreen is now handled by the onAuthStateChanged listener
    } catch (error) {
      console.error('Login error:', error);
      setLoginErrorText(error.message);
      setLoginErrorDialog(true);
    }
  };

  return (
    <Provider>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={{ alignItems: 'center' }}>
          <Text variant='displaySmall' style={{margin: 2}}>
            SurveilMap
          </Text>
          <Text variant='bodyLarge' style={{margin: 2}}>
            Seamless Camera Discovery for Smarter Patrols
          </Text>
          <Text variant='headlineMedium' style={styles.text}>
            Login
          </Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <TextInput
            label='Email'
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            keyboardType='email-address'
            autoCapitalize='none'
            returnKeyType='next'
            onSubmitEditing={() => passRef.current.focus()}
          />
          <TextInput
            label='Password'
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            style={styles.input}
            autoCapitalize='none'
            ref={passRef}
          />
          <Button
            mode='contained'
            style={{marginTop: 15}}
            onPress={async () => {
              await handleLogin();
            }}
            touchableRef={loginButtonRef}
          >
            Login
          </Button>
        </View>
      </View>
      <Portal>
        <Dialog visible={showLoginErrorDialog} onDismiss={() => setLoginErrorDialog(false)}>
          <Dialog.Title>Login Error</Dialog.Title>
          <Dialog.Content>
            <Text>{loginErrorText}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLoginErrorDialog(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    minWidth: '100%',
    flexDirection: 'column'
  },
  input: {
    marginBottom: 10,
    minWidth: '95%',
  },
  text: {
    margin: 20,
  },
});
