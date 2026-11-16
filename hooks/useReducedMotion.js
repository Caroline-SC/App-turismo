import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [reduzido, setReduzido] = useState(null);
  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(valor => { if (ativo) setReduzido(valor); }).catch(() => { if (ativo) setReduzido(true); });
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzido);
    return () => { ativo = false; assinatura.remove(); };
  }, []);
  return reduzido;
}
