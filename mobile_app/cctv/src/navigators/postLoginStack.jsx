import {createNativeStackNavigator} from "@react-navigation/native-stack";
import CustomAppBar from "../components/CustomAppBar";
import BottomTabNavigator from "./BottomNavigator";
import CameraDetails from "../screens/CameraDetails";

const PostLoginNavigator = createNativeStackNavigator();
export default function PostLoginStack() {
  return (
    <PostLoginNavigator.Navigator
      screenOptions={{
        header: (props) => <CustomAppBar {...props} />,
      }}
      initialRouteName="BottomNavigator"
      >
      <PostLoginNavigator.Screen
        name="BottomNavigator"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <PostLoginNavigator.Screen
        name='CameraDetails'
        component={CameraDetails}
        options={{
          headerShown: true,
        }}
      />
    </PostLoginNavigator.Navigator>
  )
}
