import { Appbar } from "react-native-paper";
import { getHeaderTitle } from '@react-navigation/elements';
import LogoutAction from "./LogoutAction";

export default function CustomAppBar({ navigation, route, options, back }) {
  const title = getHeaderTitle(options, route.name);

  const isElevated = back;

  return (
    <Appbar.Header mode="center-aligned" elevated={isElevated}>
      {back?
        <Appbar.BackAction onPress={navigation.goBack} /> :
        null
      }
      <Appbar.Content title={title} />
      {!back?
        <LogoutAction /> :
        null
      }

    </Appbar.Header>
  );
}
