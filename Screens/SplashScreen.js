import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Image, Animated, StatusBar, Text, Dimensions } from "react-native";
import icon from "../assets/images/official.jpeg";
import { useFonts, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim4, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim1, fadeAnim2, fadeAnim3, fadeAnim4]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Image style={styles.image} source={icon} />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim1, top: height * 0.34, right: width * 0.3}]}>
        <Text style={styles.text}>We Innovate</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim2, top: height * 0.4, right: width * 0.50 }]}>
        <Text style={styles.text}>Create</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim3, top: height * 0.4, right: width * 0.40 }]}>
        <Text style={styles.text}>&</Text>
      </Animated.View>
      <Animated.View style={[
        styles.overlay,
        { opacity: fadeAnim4, top: height * 0.4 },
        { left: width * 0.62 }
      ]}>
        <Text style={styles.text}>Scale</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
  },
  text: {
    fontSize: width * 0.1,  // Dynamic font size based on screen width
    fontWeight: '400',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});
