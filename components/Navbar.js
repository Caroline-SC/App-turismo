import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const COR_ATIVA = '#0097b2';
const COR_INATIVA = '#666666';

/** @type {{id: string, label: string, icone: import('react').ComponentProps<typeof Ionicons>['name'], iconeAtivo: import('react').ComponentProps<typeof Ionicons>['name']}[]} */
const abas = [
  { id: 'home', label: 'Início', icone: 'home-outline', iconeAtivo: 'home' },
  { id: 'explore', label: 'Explorar', icone: 'compass-outline', iconeAtivo: 'compass' },
  { id: 'itinerary', label: 'Roteiro IA', icone: 'sparkles-outline', iconeAtivo: 'sparkles' },
  { id: 'profile', label: 'Perfil', icone: 'person-outline', iconeAtivo: 'person' },
];

export default function Navbar({ abaAtiva, aoMudarAba = (_aba) => {}, totalFavoritos = 0 }) {
  const insets = useSafeAreaInsets();
  const app = useApp();

  return (
    <View
      onLayout={evento => app?.medirNavbar(evento.nativeEvent.layout.height)}
      style={[
        styles.navbar,
        { minHeight: 70 + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {abas.map((aba) => {
        const ativa = abaAtiva === aba.id;
        const cor = ativa ? COR_ATIVA : COR_INATIVA;
        const badge = aba.id === 'favorites' ? totalFavoritos : 0;

        return (
          <TouchableOpacity
            key={aba.id}
            style={styles.botaoNavbar}
            onPress={() => aoMudarAba(aba.id)}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons name={ativa ? aba.iconeAtivo : aba.icone} size={24} color={cor} />
              {badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.textoBadge}>{badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.textoNavbar, { color: cor, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, ativa && styles.textoAtivo]}>
              {aba.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e5e5', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  botaoNavbar: { flex: 1, minWidth: 0, maxWidth: '25%', paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  textoNavbar: { fontSize: 11, marginTop: 4, width: '100%', minWidth: 0, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center', includeFontPadding: true, maxWidth: '100%', lineHeight: 16 },
  textoAtivo: { fontWeight: 'bold', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  badge: { position: 'absolute', top: -5, right: -9, minWidth: 0, borderRadius: 8, backgroundColor: '#e53935', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, minHeight: 16 },
  textoBadge: { color: '#fff', fontSize: 10, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 14 },
});
