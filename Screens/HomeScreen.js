import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, StyleSheet, KeyboardAvoidingView, Text, Image, Platform, Animated, Easing, Alert, ActivityIndicator } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Montserrat_700Bold_Italic, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://people.pixelideas.site/v1/login.php"; // API endpoint

const AnimatedSquareBlock = ({ style }) => {
  const translateAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateAnim, {
            toValue: { x: 100, y: -100 }, // Adjust this value based on your requirement
            duration: 8000, // 8 seconds for movement
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: { x: 0, y: 0 },
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 15000, // 15 seconds for a full rotation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ translateX: translateAnim.x }, { translateY: translateAnim.y }, { rotate }] },
      ]}
    >
      <View style={styles.squareBlock} />
    </Animated.View>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    Montserrat_700Bold_Italic,
    Montserrat_400Regular,
  });

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          navigation.navigate('Attendence', { username: user.name });
        }
      } catch (error) {
        console.error("Failed to check login state:", error);
      }
    };

    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };

    if (fontsLoaded) {
      hideSplashScreen();
      checkLoginState();
    }
  }, [fontsLoaded]);

  const validateForm = () => {
    let errors = {};

    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setLoading(false);
  
        if (result.status === "success") {
          console.log("Login Successful", result.data);
          await AsyncStorage.setItem('userData', JSON.stringify(result.data));
          setEmail("");
          setPassword("");
          setErrors({});
          navigation.navigate('Attendence', { username: result.data.name });
        } else {
          Alert.alert("Login Failed", result.message);
        }
      } catch (error) {
        setLoading(false);
        console.error("Failed to login:", error);
        Alert.alert("Login Failed", "An error occurred. Please try again.");
      }
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      <View style={styles.background}>
        <AnimatedSquareBlock style={[styles.animatedBlock, { left: '5%', bottom: '10%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { left: '25%', bottom: '20%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { left: '40%', bottom: '45%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { right: '60%', bottom: '60%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { left: '87%', bottom: '35%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { right: '60%', bottom: '60%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { right: '87%', bottom: '71%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { left: '92%', bottom: '78%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { right: '42%', bottom: '40%', opacity: 0.2 }]} />
        <AnimatedSquareBlock style={[styles.animatedBlock, { right: '20%', bottom: '5%', opacity: 0.2 }]} />
      </View>
      <View style={styles.form}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <Button title="Login" onPress={handleSubmit} style={styles.button} disabled={loading} />
        {loading && <Text>Loading...</Text>}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0153FF",
  },
  squareBlock: {
    width: 100,
    height: 100,
    backgroundColor: "FFF",
    position: "absolute",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  label: {
    marginBottom: 5,
    fontFamily: 'Montserrat_400Regular',
  },
  button: {
    fontFamily: 'Montserrat_400Regular',
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  animatedBlock: {
    position: 'absolute',
    width: 70,
    height: 70,
    backgroundColor: '#FFF',
  },
  logo: {
    width: 190,
    height: 79,
    alignSelf: "center",
    marginBottom: 25,
    margin: 25,
  },
});

export default LoginForm;
