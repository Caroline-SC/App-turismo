import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Heart, Trash2, Star, MapPin, ArrowRight, Compass } from 'lucide-react';
import { PontoTuristico } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

interface FavoritesScreenProps {
  pontos: PontoTuristico[];
  onSelecionarPonto: (ponto: PontoTuristico) => void;
  onExplorar: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  pontos,
  onSelecionarPonto,
  onExplorar,
}) => {
  const { favoritosIds, toggleFavorito } = useFavorites();

  const pontosFavoritos = pontos.filter((p) => favoritosIds.includes(p.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <Heart size={20} color="#ffffff" fill="#ffffff" />
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {pontosFavoritos.length}{' '}
          {pontosFavoritos.length === 1 ? 'local salvo na sua lista' : 'locais salvos na sua lista'}
        </Text>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} bounces={false}>
        {pontosFavoritos.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Heart size={36} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Sua lista de favoritos está vazia</Text>
            <Text style={styles.emptyDesc}>
              Toque no ícone de coração nos pontos turísticos para salvar os locais que você deseja conhecer em Salvador.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.8} onPress={onExplorar}>
              <Compass size={16} color="#ffffff" />
              <Text style={styles.exploreBtnText}>Explorar Salvador</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pontosFavoritos.map((ponto) => (
            <TouchableOpacity
              key={ponto.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => onSelecionarPonto(ponto)}
            >
              <Image source={{ uri: ponto.imagens[0] }} style={styles.cardImage} resizeMode="cover" />

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardCategory}>{ponto.categoria}</Text>
                  <TouchableOpacity
                    style={styles.removeTouch}
                    activeOpacity={0.7}
                    onPress={(e) => {
                      // @ts-ignore
                      e.stopPropagation?.();
                      toggleFavorito(ponto.id);
                    }}
                    accessibilityLabel="Remover dos favoritos"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {ponto.nome}
                </Text>

                <Text style={styles.cardAddress} numberOfLines={1}>
                  {ponto.endereco}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.ratingRow}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingText}>{ponto.notaMedia.toFixed(1)}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.viewDetailsText}>Ver detalhes</Text>
                    <ArrowRight size={13} color="#0284c7" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0f2fe',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 110,
    height: 110,
  } as any,
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    textTransform: 'uppercase',
  },
  removeTouch: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
  },
});

export default FavoritesScreen;
