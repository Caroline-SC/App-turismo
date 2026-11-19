import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

// Usa a altura medida no aparelho, inclusive quando os rótulos quebram linha.
export function useNavbarHeight() {
  const insets = useSafeAreaInsets();
  return useApp()?.alturaNavbar || 70 + insets.bottom;
}
