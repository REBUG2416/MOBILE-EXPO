import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./HomeScreen";
import IntroScreen from "./IntroScreen";
import LoginRegister from "./LoginRegister";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { PermissionsAndroid } from "react-native";



export type RootStackParamList = {
  Intro: undefined;
  LoveTaps: undefined;
  Login: undefined;
};

const Stack = createStackNavigator();

export default function Home() {
  const [user, setUser] = useState<any>(undefined);


const requestPermissions = async () => {
  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.INTERNET);
  } catch (err) {
    console.warn("Permission request failed:", err);
  }
};

useEffect(() => {
  requestPermissions();
}, []);

  useEffect(() => {
    fetch("https://mobile-expo.onrender.com/user-by-connectionId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ connectionId: "dummy-connection" }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Server woke up:", data))
      .catch((err) => console.error("Wake-up error:", err));
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
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
        <Stack.Screen name="LoveTaps">
        {(props:any) => (
            <HomeScreen {...props} user={user} setUser={setUser} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {(props:any) => (
            <LoginRegister {...props} user={user} setUser={setUser} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}
