import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../configs/Configs';
import {useTheme} from "react-native-paper";  // Import the auth object

export default function AuthLoader({ onAuthStateResolved }) {
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        await SecureStore.setItemAsync('userToken', user.uid);
        onAuthStateResolved(true);
      } else {
        // User is signed out
        await SecureStore.deleteItemAsync('userToken');
        onAuthStateResolved(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return null;
}
