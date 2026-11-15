import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../../context/AppContext';

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><Stack id={undefined} screenOptions={{ headerShown: false, animation: 'none' }} /></AppProvider></SafeAreaProvider>;
}
