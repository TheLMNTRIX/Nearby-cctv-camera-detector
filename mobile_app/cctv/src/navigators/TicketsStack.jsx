import {createNativeStackNavigator} from "@react-navigation/native-stack";
import CustomAppBar from "../components/CustomAppBar";
import Tickets from "../screens/Tickets";

const TicketScreenNavigator = createNativeStackNavigator();
export default function TicketsStack() {
  return (
    <TicketScreenNavigator.Navigator
      screenOptions={{
        initialRouteName: 'Tickets',
        header: (props) => <CustomAppBar {...props} />,
      }}
    >
      <TicketScreenNavigator.Screen
        name='Tickets'
        component={Tickets}
        options={{
          headerShown: true,
          headerTitle: 'Tickets'
        }}
      />
    </TicketScreenNavigator.Navigator>
  )
}
