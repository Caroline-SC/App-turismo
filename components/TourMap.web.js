// react-native-maps é nativo. O iframe mantém a área do mapa no navegador.
export default function TourMap({ regiao, pontos }) {
  const bbox = [regiao.longitude - regiao.longitudeDelta, regiao.latitude - regiao.latitudeDelta,
    regiao.longitude + regiao.longitudeDelta, regiao.latitude + regiao.latitudeDelta].join(',');
  const params = new URLSearchParams({ bbox, layer: 'mapnik' });
  if (pontos[0]) params.set('marker', `${pontos[0].latitude},${pontos[0].longitude}`);
  return <iframe title="Mapa de Salvador" src={`https://www.openstreetmap.org/export/embed.html?${params}`} style={{ width: '100%', height: '100%', border: 0 }} />;
}
