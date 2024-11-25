import {createNativeStackNavigator} from "@react-navigation/native-stack";
import CctvMaps from "../screens/cctvMaps";

const CCTVMapsNavigator = createNativeStackNavigator();
export default function CCTVMapsStack() {
  return (
    <CCTVMapsNavigator.Navigator
      screenOptions={{
        initialRouteName: 'CCTVMapsPage',
      }}
    >
      <CCTVMapsNavigator.Screen
        name='CCTVMapsPage'
        component={CctvMaps}
        options={{
          headerShown: false,
          headerTitle: 'Camera Map'
        }}
      />
    </CCTVMapsNavigator.Navigator>
  )
}
