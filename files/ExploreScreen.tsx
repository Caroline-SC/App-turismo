import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Search, X, Star, Heart, MapPin, SlidersHorizontal } from 'lucide-react';
import { PontoTuristico, CategoriaPonto } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

interface ExploreScreenProps {
  pontos: PontoTuristico[];
  initialCategory?: CategoriaPonto | null;
  onSelecionarPonto: (ponto: PontoTuristico) => void;
}

const CATEGORIAS_FILTRO: Array<{ label: string; value: CategoriaPonto | 'Todas' }> = [
  { label: 'Todas', value: 'Todas' },
  { label: 'Histórico', value: 'Histórico' },
  { label: 'Religioso', value: 'Religioso' },
  { label: 'Cultural', value: 'Cultural' },
  { label: 'Praias', value: 'Praias' },
  { label: 'Gastronomia', value: 'Gastronomia' },
  { label: 'Museus', value: 'Museus' },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  pontos,
  initialCategory,
  onSelecionarPonto,
}) => {
  const { isFavorito, toggleFavorito } = useFavorites();
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaPonto | 'Todas'>(
    initialCategory || 'Todas'
  );
  const [apenasGratuitos, setApenasGratuitos] = useState(false);

  // Filter based on text query, category, and free access (UC03)
  const pontosFiltrados = useMemo(() => {
    return pontos.filter((p) => {
      const matchBusca =
        !busca.trim() ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        p.endereco.toLowerCase().includes(busca.toLowerCase());

      const matchCategoria =
        categoriaSelecionada === 'Todas' || p.categoria === categoriaSelecionada;

      const matchGratuito =
        !apenasGratuitos ||
        (p.precoMedio &&
          (p.precoMedio.toLowerCase().includes('gratuito') ||
            p.precoMedio.toLowerCase().includes('livre')));

      return matchBusca && matchCategoria && matchGratuito;
    });
  }, [pontos, busca, categoriaSelecionada, apenasGratuitos]);

  return (
    <View style={styles.container}>
      {/* Top Search App Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Explorar Salvador</Text>
        <Text style={styles.headerSubtitle}>
          Descubra a história viva e patrimônios da cidade
        </Text>

        {/* Search input field */}
        <View style={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, bairro ou monumento..."
            placeholderTextColor="#94a3b8"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')} style={styles.clearBtn}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category horizontal selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIAS_FILTRO.map((cat) => {
            const isSelected = categoriaSelecionada === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setCategoriaSelecionada(cat.value)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results stats and filter badge */}
      <View style={styles.resultsInfoBar}>
        <Text style={styles.resultsCount}>
          {pontosFiltrados.length}{' '}
          {pontosFiltrados.length === 1 ? 'local encontrado' : 'locais encontrados'}
        </Text>

        <TouchableOpacity
          style={[styles.freeFilterBtn, apenasGratuitos && styles.freeFilterBtnActive]}
          activeOpacity={0.7}
          onPress={() => setApenasGratuitos(!apenasGratuitos)}
        >
          <Text
            style={[
              styles.freeFilterText,
              apenasGratuitos && styles.freeFilterTextActive,
            ]}
          >
            {apenasGratuitos ? '✓ Entrada Gratuita' : 'Entrada Gratuita'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List of tourist spots */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        bounces={false}
      >
        {pontosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={42} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhum local encontrado</Text>
            <Text style={styles.emptyDesc}>
              Tente pesquisar por outros termos como "Pelourinho", "Barra", "Igreja" ou selecione outra categoria.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setBusca('');
                setCategoriaSelecionada('Todas');
                setApenasGratuitos(false);
              }}
            >
              <Text style={styles.resetBtnText}>Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pontosFiltrados.map((ponto) => {
            const favorito = isFavorito(ponto.id);
            return (
              <TouchableOpacity
                key={ponto.id}
                style={styles.spotCard}
                activeOpacity={0.88}
                onPress={() => onSelecionarPonto(ponto)}
              >
                <Image
                  source={{ uri: ponto.imagens[0] }}
                  style={styles.spotImage}
                  resizeMode="cover"
                />

                <View style={styles.spotBody}>
                  <View style={styles.spotHeader}>
                    <Text style={styles.spotCategory}>{ponto.categoria}</Text>
                    <TouchableOpacity
                      style={styles.spotFavTouch}
                      activeOpacity={0.7}
                      onPress={(e) => {
                        // @ts-ignore
                        e.stopPropagation?.();
                        toggleFavorito(ponto.id);
                      }}
                      accessibilityLabel="Favoritar local"
                    >
                      <Heart
                        size={18}
                        color={favorito ? '#ef4444' : '#94a3b8'}
                        fill={favorito ? '#ef4444' : 'transparent'}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.spotName} numberOfLines={1}>
                    {ponto.nome}
                  </Text>

                  <Text style={styles.spotDesc} numberOfLines={2}>
                    {ponto.chamadaCurta || ponto.descricao}
                  </Text>

                  <View style={styles.spotFooter}>
                    <View style={styles.ratingRow}>
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingVal}>{ponto.notaMedia.toFixed(1)}</Text>
                      <Text style={styles.reviewsCount}>({ponto.totalAvaliacoes})</Text>
                    </View>

                    <Text style={styles.priceTag}>{ponto.precoMedio || 'Gratuito'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  clearBtn: {
    padding: 4,
  },
  categoryScroll: {
    gap: 8,
    marginTop: 12,
    paddingBottom: 2,
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: '#ffffff',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryPillTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  resultsInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  freeFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  freeFilterBtnActive: {
    backgroundColor: '#dcfce7',
  },
  freeFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  freeFilterTextActive: {
    color: '#15803d',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  spotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  spotImage: {
    width: '100%',
    height: 140,
  } as any,
  spotBody: {
    padding: 14,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    textTransform: 'uppercase',
  },
  spotFavTouch: {
    padding: 4,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  spotDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 10,
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  reviewsCount: {
    fontSize: 11,
    color: '#94a3b8',
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ExploreScreen;
