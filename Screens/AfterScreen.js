import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const checkInTime = "10:01 AM";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckOut = () => {
    Alert.alert("Checked Out", "You have successfully checked out.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Howdy, Ankit Dalsaniya!</Text>
      <Text style={styles.time}>{currentTime}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Check-out" onPress={handleCheckOut} color="#1E90FF" />
      </View>
      <Text style={styles.checkInTime}>Check-in Time : {checkInTime}</Text>
      <Text style={styles.note}>
        Note: Check-in after 10:15 will be considered Half-Day. Also, make sure you complete 9 Hours. Thanks!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 20,
    width: '80%',
    borderRadius: 5,
  },
  checkInTime: {
    fontSize: 18,
    marginBottom: 10,
  },
  note: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
