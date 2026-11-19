import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { alturaDoTexto } from '../services/textLayout';

// Android 15+ can paint an extra line that Yoga did not reserve (#56402).
// Use the native line metrics, rather than guessing a width from characters.
/** @param {import('react').ComponentProps<typeof Text>} props */
export default function AppText({ style, onTextLayout, ref, ...props }) {
  const [altura, setAltura] = useState(0);
  const plano = StyleSheet.flatten(style) || {};
  const paddingInferior = Number(plano.paddingBottom ?? plano.paddingVertical ?? plano.padding ?? 0) || 0;
  const medir = useCallback(evento => {
    const proxima = alturaDoTexto(evento.nativeEvent.lines, paddingInferior);
    setAltura(atual => atual === proxima ? atual : proxima);
    onTextLayout?.(evento);
  }, [onTextLayout, paddingInferior]);

  if (Platform.OS !== 'android') return <Text ref={ref} {...props} style={style} onTextLayout={onTextLayout} />;
  return <Text ref={ref} android_hyphenationFrequency="none" textBreakStrategy="simple" {...props}
    style={[styles.android, style, altura > 0 && { minHeight: Math.max(altura, Number(plano.minHeight) || 0) }]}
    onTextLayout={medir} />;
}

const styles = StyleSheet.create({
  // Avoid OEM replacement fonts whose glyph bounds differ from RN measurement.
  android: { fontFamily: 'sans-serif', includeFontPadding: true },
});
