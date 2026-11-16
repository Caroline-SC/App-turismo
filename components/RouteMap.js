import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MAPA_CLARO } from './TourMap';
import { coordenadaValida } from '../services/nearby';

export default function RouteMap({ origem, destino, rota, seguindo, centralizar, chegou, padding, aoMoverMapa, aoAncorar }) {
  const mapa = useRef(null), montado = useRef(true);
  const [pronto, setPronto] = useState(false);
  const coordenadas = useMemo(() => (rota?.geometria?.coordinates || []).map(c => ({ longitude: c[0], latitude: c[1] })), [rota]);
  const inicial = coordenadaValida(destino) ? destino : coordenadaValida(origem) ? origem : { latitude: -12.9714, longitude: -38.5014 };
  useEffect(() => { montado.current = true; return () => { montado.current = false; }; }, []);
  useEffect(() => {
    if (!pronto) return;
    const centro = chegou ? destino : origem;
    if (seguindo && coordenadaValida(centro)) mapa.current?.animateCamera({ center: { latitude: centro.latitude, longitude: centro.longitude } }, { duration: 650 });
  }, [pronto, origem, destino, seguindo, centralizar, chegou, padding]);
  const ancorar = async () => {
    if (!coordenadaValida(destino)) return;
    try { const ponto = await mapa.current?.pointForCoordinate({ latitude: destino.latitude, longitude: destino.longitude }); if (montado.current && ponto) aoAncorar(ponto); } catch {}
  };
  return <MapView ref={mapa} style={StyleSheet.absoluteFill} initialRegion={{ latitude: inicial.latitude, longitude: inicial.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
    customMapStyle={MAPA_CLARO} userInterfaceStyle="light" mapPadding={padding} showsCompass={false} showsPointsOfInterests={false} showsMyLocationButton={false}
    loadingEnabled loadingIndicatorColor="#0097b2" loadingBackgroundColor="#f7f9f8" onPanDrag={aoMoverMapa} onRegionChangeComplete={ancorar} onMapReady={() => { setPronto(true); ancorar(); }}>
    {coordenadas.length > 1 && <Polyline coordinates={coordenadas} strokeColor={chegou ? '#8bd2de' : '#0097b2'} strokeWidth={6} lineCap="round" lineJoin="round" />}
    {coordenadaValida(destino) && <Marker coordinate={{ latitude: destino.latitude, longitude: destino.longitude }} title={destino.nome} tracksViewChanges={false} anchor={{ x: 0.5, y: 0.5 }}><View style={styles.destino}><View style={styles.destinoCentro} /></View></Marker>}
    {coordenadaValida(origem) && !chegou && <Marker coordinate={{ latitude: origem.latitude, longitude: origem.longitude }} tracksViewChanges={false} anchor={{ x: 0.5, y: 0.5 }} flat rotation={Number.isFinite(origem.heading) && origem.heading >= 0 ? origem.heading : 0}><View style={styles.origem}><Ionicons name="navigate" color="#ffffff" size={23} /></View></Marker>}
  </MapView>;
}
const styles = StyleSheet.create({ destino: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0097b2' }, destinoCentro: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#0097b2' }, origem: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#ffffff', backgroundColor: '#0097b2', justifyContent: 'center', alignItems: 'center' } });
