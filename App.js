import React from 'react';
import { Image, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

const Tab = createMaterialTopTabNavigator();

// Custom image icon component
const TabIcon = ({ source, color }) => (
  <Image
    source={source}
    style={{ width: 24, height: 24, tintColor: color, resizeMode: 'contain' }}
  />
);

function Navigation() {
  const { colors: Colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Tab bar height: icon (24) + label (~14) + padding + home indicator safe area
  const TAB_HEIGHT = 56 + insets.bottom;

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

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          // ── Swipe gestures ───────────────────────────────────────────────
          swipeEnabled: true,
          animationEnabled: true,
          lazy: true,             // only render screen when first visited

          // ── Tab bar appearance ───────────────────────────────────────────
          tabBarStyle: {
            backgroundColor:   Colors.card,
            borderTopColor:    Colors.border,
            borderTopWidth:    1,
            height:            TAB_HEIGHT,
            paddingBottom:     insets.bottom,   // home indicator gap on iPhone X+
            paddingTop:        8,
            // Shadow (iOS)
            shadowColor:       '#000',
            shadowOffset:      { width: 0, height: -2 },
            shadowOpacity:     0.06,
            shadowRadius:      6,
            elevation:         8,
          },
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowIcon:     true,
          tabBarShowLabel:    true,
          tabBarLabelStyle: {
            fontSize:      10,
            fontWeight:    '600',
            letterSpacing: 0.3,
            marginTop:     2,
          },
          // Hide the top indicator line (we're using this as a bottom tab)
          tabBarIndicatorStyle: { height: 0, backgroundColor: 'transparent' },
          tabBarPressColor: Colors.primary + '22',
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
