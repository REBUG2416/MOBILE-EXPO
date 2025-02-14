import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
 type RootStackParamList = {
   Intro: undefined;
   Home: undefined;
   NewEntry: { entry?: JournalEntry };
 };

interface JournalEntry {
  date: number;
  content: string;
}


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
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Home');
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require("../assets/images/splashscreen_logo.png")}
          resizeMode="cover"
          style={{width:80,height:80}}
        />
        <Text style={styles.title}>Journalie</Text>
        <Text style={styles.subtitle}>Capture your thoughts</Text>
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
    color: '#6200EE',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
  },
});

export default IntroScreen;

