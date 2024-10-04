import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, Easing, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

const TARGET_LOCATION = {
    latitude: 23.023095634068248,
    longitude: 72.54406814249094,
    radius: 100
};

const { width, height } = Dimensions.get('window');

const AnimatedSquareBlock = ({ style }) => {
    const translateAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(translateAnim, {
                        toValue: { x: 100, y: -100 },
                        duration: 8000,
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
                    duration: 15000,
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

const LoadingScreen = ({ visible }) => (
    <Modal transparent={true} animationType="fade" visible={visible}>
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0153FF" />
            <Text style={styles.loadingText}>Checking location...</Text>
        </View>
    </Modal>
);

export default function App() {
    const [currentTime, setCurrentTime] = useState("00:00:00");
    const [startTime, setStartTime] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [isCheckingLocation, setIsCheckingLocation] = useState(false); // New state variable

    let [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    const navigation = useNavigation();
    const route = useRoute();
    const { username } = route.params;

    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigation.navigate('Login');
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isRunning) {
            const timer = setInterval(() => {
                setCurrentTime(calculateElapsedTime());
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isRunning]);

    const handleCheckIn = async () => {
        setIsCheckingLocation(true); // Show loading screen
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setIsCheckingLocation(false); // Hide loading screen
            Alert.alert("Permission Denied", "Permission to access location was denied.");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const distance = getDistanceFromLatLonInMeters(
            location.coords.latitude,
            location.coords.longitude,
            TARGET_LOCATION.latitude,
            TARGET_LOCATION.longitude
        );

        console.log(`Current Location: Latitude ${location.coords.latitude.toFixed(5)}, Longitude ${location.coords.longitude.toFixed(5)}`);
        console.log(`Distance from office: ${distance.toFixed(2)} meters`);

        if (distance <= TARGET_LOCATION.radius) {
            const now = new Date();
            setStartTime(now);
            setIsRunning(true);
            setCheckInTime(now.toLocaleTimeString());
            setCheckOutTime("");
            Alert.alert("Checked In", "You have successfully checked in.");
        } else {
            Alert.alert("Check-In Failed", `You are not within the required location. Distance to target: ${distance.toFixed(2)} meters`);
        }
        setIsCheckingLocation(false); // Hide loading screen
    };

    const handleCheckOut = () => {
        const now = new Date();
        setIsRunning(false);
        setCurrentTime(calculateElapsedTime());
        setCheckOutTime(now.toLocaleTimeString());
        setIsCheckedOut(true);
        Alert.alert("Checked Out", `You have successfully checked out.`);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const calculateElapsedTime = () => {
        if (startTime) {
            const elapsedTime = new Date() - startTime;
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return currentTime;
    };

    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const addSpacesBetweenWords = (text, spaces = 1) => {
        return text.split(' ').join(' '.repeat(spaces));
    };

    const greetingMessage = addSpacesBetweenWords(`Howdy, ${username}!`);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0153FF" style={styles.loadingContainer} />;
    }

    return (
        <LinearGradient
            colors={['#0153FF', '#01BDF8']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.container}
        >
            <LoadingScreen visible={isCheckingLocation} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { left: '5%', bottom: '10%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { left: '25%', bottom: '20%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { left: '40%', bottom: '45%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { right: '60%', bottom: '60%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { left: '87%', bottom: '80%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { right: '60%', bottom: '60%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { right: '87%', bottom: '71%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { left: '92%', bottom: '89%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { right: '42%', bottom: '40%', opacity: 0.2 }]} />
            <AnimatedSquareBlock style={[styles.animatedBlock, { right: '20%', bottom: '5%', opacity: 0.2 }]} />

            <View style={styles.card}>
                <Text style={styles.greeting}>{greetingMessage}</Text>
                <View style={styles.timerContainer}>
                    {!isCheckedOut && <Text style={styles.time}>{currentTime}</Text>}
                    {isCheckedOut && (
                        <View style={styles.durationContainer}>
                            <Text style={styles.totalTime}>Duration: {calculateElapsedTime()}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.buttonContainer}>
                    {!isCheckedOut && (
                        !isRunning ? (
                            <TouchableOpacity onPress={handleCheckIn}>
                                <LinearGradient colors={['#0153FF', '#01BDF8']} start={[0, 0]} end={[1, 1]} style={styles.button}>
                                    <Text style={styles.buttonText}>Check-In</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleCheckOut}>
                                <LinearGradient colors={['#0153FF', '#01BDF8']} start={[0, 0]} end={[1, 1]} style={styles.button}>
                                    <Text style={styles.buttonText}>Check-Out</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )
                    )}
                </View>
                {checkInTime && <Text style={styles.checkInOutText}>Check-In Time: {checkInTime}</Text>}
                {checkOutTime && <Text style={styles.checkInOutText}>Check-Out Time: {checkOutTime}</Text>}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF', // White background
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        color: '#000000',
        fontFamily: 'Montserrat_500Medium',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: height * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
    },
    greeting: {
        fontSize: width * 0.05,
        fontFamily: 'Montserrat_500Medium',
        marginBottom: height * 0.02,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationContainer: {
        alignItems: 'center',
    },
    durationTitle: {
        fontSize: width * 0.04,
        fontFamily: 'Montserrat_400Regular',
    },
    time: {
        fontSize: width * 0.10,
        fontFamily: 'Montserrat_500Medium',
    },
    totalTime: {
        fontSize: width * 0.06,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    buttonContainer: {
        marginTop: height * 0.01,
        width: '100%',
    },
    button: {
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.1,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: width * 0.04,
        color: '#FFF',
        fontFamily: 'Montserrat_500Medium',
    },
    checkInOutText: {
        fontSize: width * 0.035,
        alignContent: 'center',
        textAlign: 'center',
        marginTop: height * 0.01,
        fontFamily: 'Montserrat_400Regular',
    },
    animatedBlock: {
        position: 'absolute',
        width: width * 0.18,
        height: width * 0.18,
        backgroundColor: '#FFF',
    },
    squareBlock: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFF',
    },
    logoutButton: {
        width: "100%",
        paddingVertical: height * 0.01,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF0000',
        marginBottom: height * 0.01,
        marginTop: height * 0.01,
    },
});
