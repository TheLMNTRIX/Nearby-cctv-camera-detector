import { StatusBar } from 'expo-status-bar';
import {Dimensions, StyleSheet, useColorScheme, View} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, Text} from "react-native-paper";
import {NavigationContainer} from "@react-navigation/native";
import {useEffect, useMemo, useState} from "react";
import {request, PERMISSIONS} from "react-native-permissions";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useMaterial3Theme} from "@pchmn/expo-material3-theme";
import {SafeAreaProvider} from "react-native-safe-area-context";
import Login from "./src/screens/login";
import PostLoginStack from "./src/navigators/postLoginStack";
import CustomAppBar from "./src/components/CustomAppBar";
import { setDefaults } from "react-geocode";
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthLoader from "./src/components/AuthLoader";

const { height } = Dimensions.get("window");
const Stack = createNativeStackNavigator();

setDefaults({
  key: "YOUR_API_KEY_HERE",
  language: 'en',
  region: 'in'
})

export default function App() {
  const colorScheme = useColorScheme();
  let { theme } = useMaterial3Theme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  const paperTheme = useMemo(
    () =>
      colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );

  useEffect(() => {
    requestLocationPermission();
  }, []);

  function requestLocationPermission() {
    request(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      {title: 'Allow Fine location access', message: 'Allow for current location'}
    ).then((result) => {
      console.log(result);
    })
  }

  const handleAuthStateResolved = (authState) => {
    setIsAuthenticated(authState);
    setIsAuthResolved(true);
  };

  if (!isAuthResolved) {
    return <AuthLoader onAuthStateResolved={handleAuthStateResolved} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <Stack.Navigator
                screenOptions={{
                  header: (props) => <CustomAppBar {...props} />,
                }}
                initialRouteName={isAuthenticated ? 'PostLogin' : 'login'}
                >
                  <Stack.Screen name='login' component={Login} options={{ headerShown: false }} />
                  <Stack.Screen name='PostLogin' component={PostLoginStack} options={{ headerShown: false }} />
              </Stack.Navigator>
            </SafeAreaProvider>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flex: 1,
    position: 'relative',
  },
  panelHeader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center'
  },


});
