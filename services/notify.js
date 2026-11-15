import { Alert, Platform } from 'react-native';
export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') globalThis.alert(`${titulo}\n\n${mensagem}`);
  else Alert.alert(titulo, mensagem);
}
export function confirmar(titulo, mensagem) {
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm(`${titulo}\n\n${mensagem}`));
  return new Promise(resolve => Alert.alert(titulo, mensagem, [{ text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) }, { text: 'Confirmar', style: 'destructive', onPress: () => resolve(true) }], { cancelable: true, onDismiss: () => resolve(false) }));
}
