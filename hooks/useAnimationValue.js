import { useState } from 'react';
import { Animated } from 'react-native';

// react-native-web 0.21 não exporta useAnimatedValue. O inicializador mantém
// a mesma instância de Animated.Value em todas as plataformas.
export function useAnimationValue(inicial) {
  const [valor] = useState(() => new Animated.Value(inicial));
  return valor;
}
