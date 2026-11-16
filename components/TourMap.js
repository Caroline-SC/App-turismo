import { memo, useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';

/** @type {import('react-native-maps').MapStyleElement[]} */
export const MAPA_CLARO = [
  { elementType: 'geometry', stylers: [{ color: '#f7f9f8' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#82979b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2eaeb' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f3f7f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dceef1' }] },
];
function TourMap({ style, regiao, pontos, aoAbrirLocal, localizacaoPermitida = false, centralizar = 0, paddingMapa }) {
  const [visivel, setVisivel] = useState(regiao);
  const mapaRef = useRef(null);
  const marcadores = useMemo(() => pontos.filter(p =>
    Math.abs(p.latitude - visivel.latitude) <= visivel.latitudeDelta * 0.7 &&
    Math.abs(p.longitude - visivel.longitude) <= visivel.longitudeDelta * 0.7
  ).slice(0, 60), [pontos, visivel]);
  useEffect(() => { mapaRef.current?.animateToRegion(regiao, 700); }, [regiao, centralizar]);
  return <MapView ref={mapaRef} style={style} initialRegion={regiao} customMapStyle={MAPA_CLARO} userInterfaceStyle="light"
    loadingEnabled loadingBackgroundColor="#f7f9f8" loadingIndicatorColor="#0097b2" mapPadding={paddingMapa}
    showsUserLocation={localizacaoPermitida} showsMyLocationButton={false} showsCompass={false} showsPointsOfInterests={false}
    onMapReady={() => mapaRef.current?.animateToRegion(regiao, 500)} onRegionChangeComplete={setVisivel}>
    {marcadores.map(ponto => <Marker key={ponto.id} tracksViewChanges={false}
      coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }} title={ponto.nome} description={ponto.bairro} pinColor="#0097b2"
      onCalloutPress={() => aoAbrirLocal(ponto)} />)}
  </MapView>;
}
export default memo(TourMap);
