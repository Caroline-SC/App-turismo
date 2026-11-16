import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../context/AppContext';

export function useRefreshCatalog() {
  const { atualizarCatalogo } = useApp();
  useFocusEffect(useCallback(() => { atualizarCatalogo(); }, [atualizarCatalogo]));
}
