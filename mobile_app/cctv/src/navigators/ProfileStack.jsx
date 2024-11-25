import {createNativeStackNavigator} from "@react-navigation/native-stack";
import CctvMaps from "../screens/cctvMaps";
import Profile from "../screens/profile";
import CustomAppBar from "../components/CustomAppBar";

const ProfileScreenNavigator = createNativeStackNavigator();
export default function ProfileStack() {
  return (
    <ProfileScreenNavigator.Navigator
      screenOptions={{
        initialRouteName: 'Profile',
        header: (props) => <CustomAppBar {...props} />,
      }}
    >
      <ProfileScreenNavigator.Screen
        name='Profile'
        component={Profile}
        options={{
          headerShown: true,
          headerTitle: 'Profile'
        }}
      />
    </ProfileScreenNavigator.Navigator>
  )
}
