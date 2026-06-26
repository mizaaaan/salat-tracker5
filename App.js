import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import HomeScreen    from './src/screens/HomeScreen';
import QiblaScreen   from './src/screens/QiblaScreen';
import ToolsScreen   from './src/screens/ToolsScreen';
import QuranScreen   from './src/screens/QuranScreen';
import DuaScreen     from './src/screens/DuaScreen';
import { ThemeProvider, useTheme } from './src/constants/ThemeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();

// Custom image icon component
const TabIcon = ({ source, color }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return (
    <Image
      source={source}
      style={{ width: isLandscape ? 26 : 24, height: isLandscape ? 26 : 24, tintColor: color, resizeMode: 'contain' }}
    />
  );
};

function Navigation() {
  const { colors: Colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: Colors.background,
      card:       Colors.card,
      border:     Colors.border,
      text:       Colors.text,
      primary:    Colors.primary,
    },
  };

  // Only override height/padding in landscape â spreading nothing in portrait
  // avoids passing `undefined` values that collapse the tab bar.
  const landscapeTabBarStyle = isLandscape
    ? { height: 64, paddingBottom: 10, paddingTop: 6 }
    : {};

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopColor:  Colors.border,
            borderTopWidth:  1,
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: -2 },
            shadowOpacity:   0.06,
            shadowRadius:    6,
            elevation:       8,
            ...landscapeTabBarStyle,
          },
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowLabel:         true,
          tabBarLabelStyle: {
            fontSize:      10,
            fontWeight:    '600',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tab.Screen
          name="Prayer Times"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon source={require('./assets/prayertime.png')} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Qibla"
          component={QiblaScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon source={require('./assets/qibla.png')} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon source={require('./assets/tools.png')} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Quran"
          component={QuranScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon source={require('./assets/quran.png')} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Dua"
          component={DuaScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon source={require('./assets/dua.png')} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
