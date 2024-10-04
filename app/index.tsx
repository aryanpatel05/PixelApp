import 'react-native-gesture-handler';
import * as React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform, BackHandler } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';

import SplashScreen from '../Screens/SplashScreen';
import HomeScreen from '../Screens/HomeScreen';
import CheckinScreen from '../Screens/Checki-Screen'; // Corrected import

type RootStackParamList = {
  Login: undefined;
  Attendence: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const NOTIFICATION_TASK_NAME = 'DAILY_NOTIFICATION_TASK';

export default function App() {
  const [isShowSplashScreen, setIsShowSplashScreen] = React.useState(true);
  const navigationRef = React.useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Load fonts
  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplashScreen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    registerNotificationTask();
    scheduleDailyNotification();
  }, []);

  React.useEffect(() => {
    const backAction = () => {
      const navigation = navigationRef.current;
      if (navigation && navigation.getCurrentRoute && navigation.getCurrentRoute()?.name === 'Attendence') {
        // Disable back button and gesture for CheckinScreen
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const registerNotificationTask = () => {
    TaskManager.defineTask(NOTIFICATION_TASK_NAME, ({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Reminder',
          body: 'This is your daily notification at 10 AM',
        },
        trigger: null,
      });
    });
  };

  const scheduleDailyNotification = async () => {
    const trigger = new Date();
    trigger.setHours(10);
    trigger.setMinutes(0);
    trigger.setSeconds(0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Reminder',
        body: 'Check-In Reminder',
      },
      trigger: {
        hour: 10,
        minute: 0,
        repeats: true,
      },
    });
  };

  // Set up notification channels for Android
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  if (isShowSplashScreen) {
    return <SplashScreen />;
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} independent={true}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={HomeScreen} />
            <Stack.Screen
              name="Attendence"
              component={CheckinScreen}
              options={{
                gestureEnabled: false,
                headerLeft: () => null, // Disable the back button
              }}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
    backgroundColor: '#0153FF',
  },
  text: {
    fontFamily: 'Montserrat_500Medium', // Use the loaded font
  },
});
