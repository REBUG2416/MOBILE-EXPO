import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
 type RootStackParamList = {
   Intro: undefined;
   LoveTaps: undefined;
   Login: undefined;
  };



type IntroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Intro'>;

type Props = {
  navigation: IntroScreenNavigationProp;
};

const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }), 
    ]).start(() => {
      return navigation.replace('Login');
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require("../assets/images/love-milk-and-mocha-bear.gif")}
          resizeMode="cover"
          style={{width:150,height:150}}
        />
        <Text style={styles.title}>💙LoveTaps💜</Text>
        <Text style={styles.subtitle}>Just for the both of us.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#cb4646',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
  },
});

export default IntroScreen;

