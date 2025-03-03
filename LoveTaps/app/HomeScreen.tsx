import React, { useEffect, useRef, useState } from "react";
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { Image } from 'expo-image';
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Platform,
  ScrollView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics"; // Import haptics
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useInteropClassName } from "expo-router/build/link/useLinkHooks";

type RootStackParamList = {
  Intro: undefined;
  LoveTaps: undefined;
  Login: undefined;
};



type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'LoveTaps'>;
type HomeRegisterProps = StackScreenProps<RootStackParamList, "LoveTaps"> & {
    user: any;
    setUser: (user: any) => void;
    navigation: HomeNavigationProp;
  };


const HomeScreen:React.FC<HomeRegisterProps> = ({navigation, user, setUser })=>{
  const [isConnected, setIsConnected] = useState(false);
  const [lastTap, setLastTap] = useState<Date | null>(null);
  const [intense, setIntense] = useState<number>(0);
  const [hamMenu, setHamMenu] = useState(false);
  const [prfMenu, setPrfMenu] = useState(false);
  const [tapAnim, setTapAnim] = useState(-1);
  const [selBtn, setSelBtn] = useState(require("../assets/images/heart (1).png"));
  const [selAvatar, setSelAvatar] = useState(0);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const growthAnim = useRef(new Animated.Value(0)).current;
  const spiralAnim = useRef(new Animated.Value(0)).current;
  const [partnerData, setPartnerData] = useState<any | null>();
  const [connectId,setConnectId] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  

  const { width } = Dimensions.get("window");
  useEffect(()=>{

  const getSelHeart = async ()=>{

    const selHeart = await AsyncStorage.getItem("selHeart");
    if (selHeart) {
        console.log(partnerData);
        
    setSelBtn(JSON.parse(selHeart))
    
    } 
  }
  getSelHeart();
  },[])


  useEffect(()=>{
    if(user.avatar !== null)
    setSelAvatar(user.avatar)
  },[user])

  const updateAvatar = async (id: number) => {
    
    if(selAvatar){
      await AsyncStorage.setItem("user", JSON.stringify({username:user.username,token:user.token,connectId:user.connectionId,avatar:selAvatar}));
      fetch("https://mobile-expo.onrender.com/update-avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, avatar:id })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Convert response to JSON
      })
        .then(data => console.log(data))
        .catch(err => console.error(err));
      
    }
  }

const handleLogout = async () => {
setUser({});
setPartnerData({});
setSelAvatar(0);
setIsConnected(false);
setHamMenu(false);
setPrfMenu(false);
setSelBtn(require("../assets/images/heart (1).png"))
setConnectId("");
setIsConnecting(false);
await AsyncStorage.clear();
navigation.replace('Login');


}

  const connectPartner = () => {
    console.log("Connecting with ID:", connectId);
  
    if (!connectId) {
      Alert.alert("Error", "Please enter a connection ID!");
      return;
    }
  
    fetch("https://mobile-expo.onrender.com/user-by-connectionId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ connectionId: connectId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Convert response to JSON
      })
      .then(async data => {
        console.log("Connect successful:", data);
        await AsyncStorage.setItem("partner", JSON.stringify(data));
        setPartnerData(data);
        setIsConnected(true);
        setIsConnecting(false);
        Alert.alert("Connected", "You are now connected with your partner!");
      })
      .catch(error => {
        console.error("Error:", error);
        Alert.alert("Connection Failed", error.message);
      });
  };
  

  useEffect(()=>{
  const getPartnerData = async ()=>{

    const partnerData = await AsyncStorage.getItem("partner");
    if (partnerData) {
        console.log(partnerData);
        
    setPartnerData(JSON.parse(partnerData))
    setIsConnected(true);
    setIsConnecting(false);
    } 
  }
  getPartnerData();

  },[])
  
  const sendPushNotification = async (token:string | undefined,Type:number) => {
  if (!token) {
    Alert.alert("Error", "Your partner’s device is not registered.");
    return;
  }
  let message;
if(Type === 0.7){
  message = {
    to: token,
    sound: "default",
    title: "💙Just you and me💜",
    body: "Thinking about you😍",
    data: { action: "love_tap" },
  }
}
if(Type === 0.5){
  message = {
    to: token,
    sound: "default",
    title: "Hope you're fine🫂",
    body: user.username+" is checking on you😘",
    data: { action: "love_tap" },
  }
}
if(Type === 0.9){
  message = {
    to: token,
    sound: "default",
    title: "💖Love Bomb!!!!!!!!!!!",
    body:  user.username+" misses you like crazy💞💞💞",
    data: { action: "love_tap" },
  }
}
if(Type === 0){
  message = {
    to: token,
    sound: "default",
    title: "I miss you🥺",
    body:  user.username+" sent you a Love Tap❣️",
    data: { action: "love_tap" },
  }

}


  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

  const Buttons = [
    require("../assets/images/hand.png"),
    require("../assets/images/heartBlue.png"),
    require("../assets/images/heartPurple.png"),
    require("../assets/images/heart-rate.png"),
    require("../assets/images/heart-attack.png"),
    require("../assets/images/heart (1).png"),
    require("../assets/images/heart (4).png"),
    require("../assets/images/heart (3).png"),
    require("../assets/images/heart (2).png"),
    require("../assets/images/love-always-wins.png"),
    require("../assets/images/leah2.png"),

  ];

  const Avatar = [
    require("../assets/images/profile4.png"),
    require("../assets/images/profile1.jpg"),
    require("../assets/images/profile2.jpg"),
    require("../assets/images/profile3.jpg"),
  ];


  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  let shakeAnimation: Animated.CompositeAnimation | null = null;

  Animated.timing(spiralAnim, {
    toValue: intense,
    duration: 1000,
    useNativeDriver: true,
  }).start();

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
    startTime.current = Date.now();
  };

  const onPressOut = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Stop the interval
    }
    setTapAnim(intense);
    if (partnerData.token !== undefined) {
      sendPushNotification(partnerData.token,intense)
    }
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    });

    Animated.timing(growthAnim, {
      toValue: 1.3,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(growthAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {});
    });

    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Function to start shaking & haptics/vibration
  const startShake = () => {
    setTapAnim(-1);
    const startAnimation = (intensity: number) => {
      scaleValue.stopAnimation((currentValue) => {
        if (currentValue === 1) return; // Stop if button is released
      });

      if (shakeAnimation) {
        shakeAnimation.stop();
      } // Stop previous animation

      if (intensity > 0) {
        shakeAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: intensity,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -intensity,
              duration: 50,
              useNativeDriver: true,
            }),
          ])
        );

        shakeAnimation.start();

        // Handle vibration or haptic feedback
        if (Platform.OS === "ios") {
          if (intensity === 2) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIntense(0.5);
          } else if (intensity === 5) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIntense(0.7);
          } else if (intensity === 10) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Vibration.vibrate([100, 200, 100, 200], true);
            setIntense(0.9);
          }
        } else {
          if (intensity === 2) {
            Vibration.vibrate([100, 200, 100, 200], true);
            setIntense(0.5);
          } else if (intensity === 5) {
            Vibration.vibrate([100, 300, 100, 300], true);
            setIntense(0.7);
          } else if (intensity === 10) {
            Vibration.vibrate([100, 500, 100, 500], true);
            setIntense(0.9);
          }
        }
      }
    };
    intervalRef.current = setInterval(() => {
      const holdTime = Date.now() - startTime.current;

      if (holdTime < 2000) {
        startAnimation(0);
      }
      if (holdTime > 2000 && holdTime < 4000) {
        startAnimation(2);
      } else if (holdTime > 4000 && holdTime < 7000) {
        startAnimation(5);
      } else if (holdTime > 7000) {
        startAnimation(10);
      }
    }, 50); // Check every 100ms
  };

  // Function to stop shaking & vibration
  const stopShake = () => {
    if (shakeAnimation) shakeAnimation.stop();
    shakeAnim.setValue(0);
    Vibration.cancel();
    setIntense(0);
  };

  const handleHeartPress = () => {
    if (!isConnected) {
      Alert.alert("Not Connected", "Please connect with your partner first.");
      return;
    }

    setLastTap(new Date());
  };

  const createArrayForWidth = (width: number) => {
    const numElements = Math.floor(width / 51);
    return Array.from({ length: numElements }, (_, i) => i);
  };
  

  const heartcuds = createArrayForWidth(width);
  
  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{
     flex:1,
    }}
  >
    <View style={styles.container}>
      <View   style={{
        display:"flex",
 flexDirection:"row",
 width:width,
 justifyContent:"space-between",
 alignItems:"center",
          position: "absolute",
          zIndex: 1,
          paddingHorizontal:20,
          top: 15,
             }}>
               <View style={{display:"flex", flexDirection:"row",gap:5, justifyContent:"center",alignContent:"center"
              }}>
        <TouchableOpacity onPress={() => {
          setHamMenu(!hamMenu);
        }}
>
        <Image source={!hamMenu ? require("../assets/images/menus (1).png") : require("../assets/images/close.png")}  style={{
          height: 35,
          width: 35,
        }}  />
        </TouchableOpacity>

        {hamMenu && <TouchableOpacity style={{backgroundColor:"red", padding:8,borderRadius:10}} onPress={handleLogout}>
          <Text style={styles.connectButtonText}>Log out</Text>
        </TouchableOpacity>}
        </View>
        <TouchableOpacity onPress={() => {
          setPrfMenu(!prfMenu)
        }}

        style={{
          borderColor:"white",
          backgroundColor:"black",
          borderWidth:0.5,
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          borderRadius:100,
          height: 45,
          width: 45,

          }}
>
        <Image source={Avatar[selAvatar]}  style={{
          height: 35,
          width: 25,
        }}  />
        </TouchableOpacity>
        

      {prfMenu && <View style={{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        paddingHorizontal:10,
        paddingVertical:10,
        position: "absolute",
        borderRadius:10,
        borderWidth:0.5,
        backgroundColor:"#131415",
        borderColor:"grey",
        gap:10,
        zIndex: 1,
        top: 60,
        right: 30,
      }}>
        
        {selAvatar === -1 ? <ScrollView
        style={{
display:"flex",
marginVertical:30,
paddingHorizontal:50,
gap:5,

        }}
      >
        {Avatar.map((btn, index) => (
              <TouchableOpacity key={index}
              onPress={() => {
                setSelAvatar(index);
                updateAvatar(index);
              }}

        style={{
          borderColor:"white",
          backgroundColor:"black",
          borderWidth:0.5,
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          borderRadius:100,
          height: 35,
          width: 35,
          marginVertical:6,

          }}
>
        <Image source={btn}  style={{
          height: 35,
          width: 25,
          borderRadius:100,

        }}  />
        </TouchableOpacity>
        ))}
      </ScrollView> :
        <>
      <TouchableOpacity onPress={() => {
        }}
        style={{
          borderColor:"white",
          borderWidth:0.5,
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          borderRadius:100,
          height: 45,
          width: 45,

          }}
>
        <Image source={Avatar[selAvatar]}  style={{
          height: 35,
          width: 25,
        }}  />
        </TouchableOpacity>
        <Text style={{color:"white"}}>{user.username}</Text>
        <TouchableOpacity style={{
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,}} onPress={() => {
      setSelAvatar(-1);
  }} >
          <Text style={{color:"white"}}>Change Avatar</Text>
        </TouchableOpacity>
        {partnerData && <>
        <Text style={{color:"white"}}>{partnerData.username}</Text>
        <TouchableOpacity 

        style={{
          borderColor:"white",
          backgroundColor:"black",
          borderWidth:0.5,
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          borderRadius:100,
          height: 45,
          width: 45,

          }}
>
        <Image source={Avatar[partnerData.avatar]}  style={{
          height: 35,
          width: 25,
        }}  />
        </TouchableOpacity>
        </>}
        </>}
          </View>}
        </View>

      {hamMenu && <ScrollView
        style={{
          position: "absolute",
          height: 124,
          zIndex: 1,
          top: 60,
          left: 20,
          width: 135,
        }}
      >
        {Buttons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItems}
              onPress={async () => {
                setSelBtn(btn);
                await AsyncStorage.setItem("selHeart", JSON.stringify(btn));
              }}
            >
              <Text  style={{ fontSize: 15 }}>Select:</Text>
              <Image style={{ width: 30, height: 30 }} source={btn} />
            </TouchableOpacity>
        ))}
  <Image style={{ width: 30, height: 30, position:"absolute", }} source={require(`../assets/images/down-arrow.png`)}
/>
      </ScrollView>}

      {heartcuds.map((e, index) => (
        <Animated.View
          key={index}
          style={[
            styles.heartCuds,
            {
              opacity: tapAnim > 0.5 ? opacityAnim : 0,
              left: -35 + 60 * index,
              bottom: -40,

              transform: [{ scaleY: tapAnim > 0.5 ? growthAnim : 0 }],
            },
          ]}
        >
          <Image
            key={index}
            source={require(`../assets/images/Cuddling Gif.gif`)}
            style={[
              {
                width: 120,
                height: 200,
              },
            ]}
          />
        </Animated.View>
      ))}
        <Animated.View        style={[
          styles.heartCuds,
          {
            opacity: tapAnim > -1 ? opacityAnim : 0,
            top: 60,
            left: -20,
          },
        ]}> 
      <Image
        source={require(`../assets/images/Cuddling Gif.gif`)}
        style={[
          styles.heartCuds,
          {
            width: 150,
            height: 200,
          },
        ]}
      />
      </Animated.View>
      <Animated.View        style={[
          styles.heartCuds,
          {
            opacity: tapAnim > 0.4 ? opacityAnim : 0,
            top: 0,
            right: 140,
          },
        ]}> 
      <Image
        source={require(`../assets/images/Cuddling Gif.gif`)}
        style={[
          styles.heartCuds,
          {
            width: 150,
            height: 200,
          },
        ]}
      />
      </Animated.View>

      <Animated.View        style={[
          styles.heartCuds,
          {
            opacity: tapAnim > -1 ? opacityAnim : 0,
            top: 350,
            right: 140,
          },
        ]}> 
      <Image
        source={require(`../assets/images/Cuddling Gif.gif`)}
        style={[
          styles.heartCuds,
          {
            width: 150,
            height: 200,
          },
        ]}
      />
      </Animated.View>

      <Animated.View        style={[
          styles.heartCuds,
          {
            opacity: tapAnim > 0.4 ? opacityAnim : 0,
            bottom: 350,
            left: -20,
          },
        ]}> 
      <Image
        source={require(`../assets/images/Cuddling Gif.gif`)}
        style={[
          styles.heartCuds,
          {
            width: 150,
            height: 200,
          },
        ]}
      />
      </Animated.View>

      <Animated.View        style={[
          styles.heartflow,
          {
            zIndex: tapAnim > 0.7 ? 10 : -10,
            opacity: tapAnim > 0.7 ? opacityAnim : 0,
          },
        ]}> 
      <Image
        source={require(`../assets/images/download (1).gif`)}
        style={[
          styles.heartflow,
          {
            width: width,
            height: 1000,
          },
        ]}
      />
      </Animated.View>

    <TouchableWithoutFeedback
        style={[
          styles.heartContainer,
          { transform: [{ scale: scaleValue }, { translateX: shakeAnim }] },
        ]}
      >
    <Animated.View  style={[
            styles.heartflow,
            { transform: [{ scaleX: spiralAnim }, { scaleY: spiralAnim }] },
          ]}>
    <Image
          source={require('../assets/images/download.gif')}
          style={[          
{ width:500, height:500,zIndex:9999,
}]}
        />
    </Animated.View>
      
        <TouchableWithoutFeedback
          style={[
            styles.heartButton,
            { transform: [{ scale: scaleValue }, { translateX: shakeAnim }], backgroundColor:selBtn === require("../assets/images/leah2.png") ? "3d362e" : "white" }, 
          ]}
          onPress={handleHeartPress}
          onPressIn={() => {
            if(isConnected){
            onPressIn();
            startShake();
            }
          }}
          onPressOut={() => {
            if(isConnected){
            onPressOut();
            stopShake();
            }
          }}
        >
          {isConnected ? (
            <Image source={selBtn} style={styles.heart} />
          ) : (
            <Image
              source={require(`../assets/images/heartInactive.png`)}
              style={styles.heart}
            />
          )}
        </TouchableWithoutFeedback>
      </TouchableWithoutFeedback>
      <Text style={styles.statusText}>Your ConnectionID : <Text style={{fontWeight:"900"}}>{user.connectionId !== undefined && user.connectionId.slice(0,13)}</Text></Text>
      <Text style={styles.statusText}>
        {isConnected ? "Connected with partner" : "Not connected"}
      </Text>
      {lastTap && (
        <Text style={styles.lastTapText}>
          Last tapped: {lastTap.toLocaleTimeString()}
        </Text>
      )}
      {isConnected === false && isConnecting === false  && (
        <TouchableOpacity style={styles.connectButton} onPress={()=>{setIsConnecting(true)}}>
          <Text style={styles.connectButtonText}>Connect with Partner</Text>
        </TouchableOpacity>
      ) 
}
      {isConnected === false && isConnecting === true  &&
        <> 
      <View style={{
        display:"flex",
        flexDirection:"row",
        alignItems:"center",
        gap:5,
        marginTop:5,

        
    }}>
      <TextInput
        style={{
          borderColor:"white",
          borderRadius:10,
      borderWidth:0.3,
      padding:5,
   height:40,
   color:"white",
   width:175,
  }}
        placeholder="Enter partner connection ID"
        value={connectId}
        onChangeText={setConnectId}
        keyboardType="default"
        autoCapitalize="none"
        returnKeyType="done"
      />
              <TouchableOpacity style={{marginTop:0,  paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#3498db",
    borderRadius: 5,}} onPress={connectPartner}>
          <Text style={styles.connectButtonText}>✅</Text>
        </TouchableOpacity>
        </View>
      </>}
      {isConnected === true && isConnecting === false  && (
        <TouchableOpacity style={[styles.connectButton,{backgroundColor:"grey"}]} onPress={()=>{setIsConnecting(false);setIsConnected(false);setPartnerData({})}}>
          <Text style={styles.connectButtonText}>Disconnect Partner</Text>
        </TouchableOpacity>
      ) 
}
      <View style={styles.loveText}>
        <Text style={{ color: "red", width: 160 }}>From Kababi With Love</Text>
        <Image
          source={require(`../assets/images/heart2.png`)}
          style={{
            width: 35,
            height: 25,
            position: "absolute",
            right: -5,
            top: 0,
          }}
        />
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}
export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#282c32",
  },
  heartCuds: {
    position: "absolute",
  },

  heartContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  listItems: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingRight:15,
    paddingVertical: 15,
    backgroundColor: "white",
    gap: 10,
    borderRadius: 15,
    width: 120,
    borderWidth: 1,
  },

  heartflow: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transitionDuration: "2s",
  },

  heartButton: {
    width: 200,
    height: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  heart: {
    width: 100,
    height: 100,
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    color: "#34495e",
  },

  loveText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    bottom: 90,
  },
  lastTapText: {
    marginTop: 10,
    fontSize: 16,
    color: "#7f8c8d",
  },
  connectButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
  },
});
