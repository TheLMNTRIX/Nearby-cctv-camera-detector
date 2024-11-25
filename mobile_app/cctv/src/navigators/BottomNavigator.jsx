import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import {useTheme} from "react-native-paper";
import CctvMaps from "../screens/cctvMaps";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Profile from "../screens/profile";
import CustomAppBar from "../components/CustomAppBar";
import CCTVMapsStack from "./CCTVMapsStack";
import ProfileStack from "./ProfileStack";
import Tickets from "../screens/Tickets";
import TicketsStack from "./TicketsStack";

const BottomNavigator = createMaterialBottomTabNavigator();
export default function BottomTabNavigator() {
  return (
    <BottomNavigator.Navigator
      theme={useTheme()}
      initialRouteName="CCTVMaps"
      screenOptions={{
        header: (props) => <CustomAppBar {...props} />,
      }}
    >
      <BottomNavigator.Screen
        name='CCTVMaps'
        component={CCTVMapsStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="map"
              size={26}
              color={color}
            />
          ),
          headerShown: true,
        }}
      />
      <BottomNavigator.Screen
        name='AddCameraScreen'
        component={TicketsStack}
        options={{
          tabBarLabel: 'Add Camera',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="video-plus"
              size={26}
              color={color}
            />
          )
        }}
      />
      <BottomNavigator.Screen
        name='ProfileScreen'
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="account"
              size={26}
              color={color}
            />
          )
        }}
      />
    </BottomNavigator.Navigator>
  )
}
