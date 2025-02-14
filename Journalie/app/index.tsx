import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./HomeScreen";
import NewEntryScreen from "./NewEntryScreen";
import IntroScreen from "./IntroScreen";

interface JournalEntry {
  date: number;
  content: string;
}

export type RootStackParamList = {
  Intro: undefined;
  Home: undefined;
  NewEntry: { entry?: JournalEntry };
};

const Stack = createStackNavigator();

export default function Home() {
  return (
    <SafeAreaProvider>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#282c32",
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="NewEntry"
            component={NewEntryScreen}
            options={{ title: "Journal" }}
          />
        </Stack.Navigator>
    </SafeAreaProvider>
  );
}
