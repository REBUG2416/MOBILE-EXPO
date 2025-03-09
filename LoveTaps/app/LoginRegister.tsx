"use client";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Image } from 'expo-image';

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  Intro: undefined;
  LoveTaps: undefined;
  Login: undefined;
};

type LoginNavigationProp = StackNavigationProp<RootStackParamList, "Login">;
type LoginRegisterProps = StackScreenProps<RootStackParamList, "Login"> & {
  user: any;
  setUser: (user: any) => void;
  navigation: LoginNavigationProp;
};

const LoginRegister: React.FC<LoginRegisterProps> = ({
  navigation,
  user,
  setUser,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [Name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [myToken, setMyToken] = useState<string>();

  const { width } = Dimensions.get("window");

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Error", "Push notifications only work on a physical device.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permission Denied", "Enable notifications to receive alerts.");
    return;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log("Expo Push Token:", token);

  return token;
}
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setMyToken(token);
    });
  }, []);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received:", notification);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  useEffect(() => {
    checkLogin();
    }, []);

    const checkLogin = async ()=>{
      const userData = await AsyncStorage.getItem("user");
      if (userData !== undefined) {
          console.log(userData);  
      setUser(JSON.parse(userData!))
        console.log("User is already logged in:", userData);  
        navigation.replace("LoveTaps");
      } else {
        console.log("User needs to log in.");
      }  
    }
 
  const handleSubmit = () => {
    if (isLogin) {
      if (Name && password) {
        console.log("Logging in with:", Name, password);

        fetch("https://mobile-expo.onrender.com/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: Name,
            password: password,
            token: myToken,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Convert response to JSON
          })
          .then(async (data) => {
            console.log("Login successful:", data);
            setUser(data);

            // Store user login info
            await AsyncStorage.setItem("user", JSON.stringify(data));
            navigation.replace("LoveTaps");
          })
          .catch((error) => console.error("Error:", error));
      }
    } else {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
      console.log("Registering with:", Name, password);
      console.log("Sending request with:", {
        username: Name,
        password: password,
      });
      if (Name && password) {
        fetch("https://mobile-expo.onrender.com/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: Name,
            password: password,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Convert response to JSON
          })
          .then(async (data) => {
            console.log("Register successful:", data);
            setIsLogin(true);
          })
          .catch((error) => console.error("Error:", error));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, paddingVertical: "27%", gap: 40 }}>
          <TouchableOpacity>
            <Image
              source={require("../assets/images/heartIcon2.png")}
              style={{ width: 120, height: 120, marginHorizontal: "auto" }}
            />
          </TouchableOpacity>
          <View style={styles.inner}>
            <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={Name}
              onChangeText={setName}
              placeholderTextColor="#efefef"
              keyboardType="default"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#efefef"
              secureTextEntry
              returnKeyType={isLogin ? "done" : "next"}
            />
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#efefef"
                secureTextEntry
                returnKeyType="done"
              />
            )}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchText}>
                {isLogin
                  ? "Need an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
export default LoginRegister;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282c32",
  },
  inner: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchText: {
    color: "#007AFF",
    marginTop: 20,
  },
});
