import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COR_ATIVA = '#0097b2';
const COR_INATIVA = '#666666';

const abas = [
  { id: 'home', label: 'Início', icone: 'home-outline', iconeAtivo: 'home' },
  { id: 'explore', label: 'Explorar', icone: 'compass-outline', iconeAtivo: 'compass' },
  { id: 'favorites', label: 'Favoritos', icone: 'heart-outline', iconeAtivo: 'heart' },
  { id: 'itinerary', label: 'Roteiro IA', icone: 'sparkles-outline', iconeAtivo: 'sparkles' },
  { id: 'profile', label: 'Perfil', icone: 'person-outline', iconeAtivo: 'person' },
];

export default function Navbar({ abaAtiva, aoMudarAba = () => {}, totalFavoritos = 0 }) {
  const insets = useSafeAreaInsets();

  // Se o aparelho não informar a área segura no Android, usa um mínimo de 24
  const margemInferior = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 0);

  return (
    <View
      style={[
        styles.navbar,
        { height: 70 + margemInferior, paddingBottom: margemInferior },
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
            <Text style={[styles.textoNavbar, { color: cor }, ativa && styles.textoAtivo]}>
              {aba.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoNavbar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNavbar: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    minWidth: 70,
  },
  textoAtivo: {
    fontWeight: 'normal',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  textoBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});