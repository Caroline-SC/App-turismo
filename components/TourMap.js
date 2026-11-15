import { memo, useMemo, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
function TourMap({ style, regiao, pontos, aoAbrirLocal }) {
  const [visivel, setVisivel] = useState(regiao);
  const marcadores = useMemo(() => pontos.filter(p =>
    Math.abs(p.latitude - visivel.latitude) <= visivel.latitudeDelta * 0.7 &&
    Math.abs(p.longitude - visivel.longitude) <= visivel.longitudeDelta * 0.7
  ).slice(0, 60), [pontos, visivel]);
  return <MapView style={style} initialRegion={regiao} loadingEnabled onRegionChangeComplete={setVisivel}>{marcadores.map(ponto => <Marker key={ponto.id} tracksViewChanges={false}
    coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }} title={ponto.nome} pinColor="red"
    onCalloutPress={() => aoAbrirLocal(ponto)} />)}</MapView>;
}
export default memo(TourMap);
