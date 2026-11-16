import { lazy, Suspense, useCallback } from 'react';
import { Redirect, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useApp } from '../context/AppContext';
import { avisar } from '../services/notify';
const Login = carregarTela(() => import('../components/Login'));
const Register = carregarTela(() => import('../components/Register'));
const Home = carregarTela(() => import('../components/Home'));
const Explore = carregarTela(() => import('../components/Explore'));
const Profile = carregarTela(() => import('../components/Profile'));
const Itinerary = carregarTela(() => import('../components/Itinerary'));
const PlaceDetail = carregarTela(() => import('../components/PlaceDetail'));
const TripDetail = carregarTela(() => import('../components/TripDetail'));
const TripNavigation = carregarTela(() => import('../components/TripNavigation'));

function carregarTela(loader) {
  const Tela = lazy(loader);
  return function TelaSobDemanda(props) { return <Suspense fallback={null}><Tela {...props} /></Suspense>; };
}

const destinos = { home: '/home', explore: '/explore', profile: '/profile', itinerary: '/itinerary' };
const mudarAba = aba => router.replace(destinos[aba] || '/home');
const abrirLocal = local => router.push({ pathname: '/place/[id]', params: { id: local.id } });
function Protegida({ children }) {
  const { user, verificando } = useApp();
  if (verificando) return null;
  return user ? children : <Redirect href="/login" />;
}
export function IndexScreen() {
  const { user, verificando } = useApp();
  return verificando ? null : <Redirect href={user ? '/home' : '/login'} />;
}
export function LoginScreen() {
  const { user, verificando, login } = useApp();
  if (verificando) return null;
  if (user) return <Redirect href="/home" />;
  return <Login aoLogar={login} irParaCadastro={() => router.push('/register')} />;
}
export function RegisterScreen() {
  const { user } = useApp();
  if (user) return <Redirect href="/home" />;
  return <Register aoCadastrar={() => router.replace('/login')} irParaLogin={() => router.replace('/login')} />;
}
export function HomeScreen() { return <Protegida><Home aoMudarAba={mudarAba} aoAbrirLocal={abrirLocal} /></Protegida>; }
export function ExploreScreen() { return <Protegida><Explore aoMudarAba={mudarAba} /></Protegida>; }
const abrirRoteiro = id => router.push({ pathname: '/trip/[id]', params: { id } });
export function ItineraryScreen() { return <Protegida><Itinerary aoMudarAba={mudarAba} aoAbrirRoteiro={abrirRoteiro} /></Protegida>; }
export function TripScreen() {
  const { id } = useLocalSearchParams();
  return <Protegida><TripDetail key={String(id)} roteiroId={id} aoVoltar={() => router.replace('/itinerary')}
    aoIniciar={tripId => router.push({ pathname: '/trip/[id]/navigate', params: { id: tripId } })} aoAbrirLocal={abrirLocal} aoMudarAba={mudarAba} /></Protegida>;
}
export function TripNavigationScreen() {
  const { id } = useLocalSearchParams();
  return <Protegida><TripNavigation key={String(id)} roteiroId={id} aoVoltar={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/trip/[id]', params: { id: String(id) } })} aoAbrirLocal={abrirLocal} aoMudarAba={mudarAba} /></Protegida>;
}
export function ProfileScreen() {
  const { user, favoritos, visitados, logout, salvarInteresses, carregarPerfil, carregandoPerfil, erroPerfil, alternarFavorito } = useApp();
  useFocusEffect(useCallback(() => { carregarPerfil(); }, [carregarPerfil]));
  const sair = async () => { try { await logout(); router.replace('/login'); } catch (err) { avisar('Sair da conta', err.message); } };
  return <Protegida><Profile nome={user?.name} email={user?.email} favoritos={favoritos} visitados={visitados} interesses={user?.interesses}
    carregando={carregandoPerfil} erro={erroPerfil} aoAtualizar={carregarPerfil} aoAlternarFavorito={alternarFavorito}
    aoAbrirLocal={abrirLocal} aoSalvarInteresses={salvarInteresses} aoMudarAba={mudarAba} aoSair={sair} /></Protegida>;
}
export function PlaceScreen() {
  const { id } = useLocalSearchParams();
  const { pontos } = useApp();
  const inicial = pontos.find(p => p.id === id);
  return <Protegida><PlaceDetail key={typeof id === 'string' ? id : 'place'} local={inicial} pontoId={typeof id === 'string' ? id : null}
    aoVoltar={() => router.canGoBack() ? router.back() : router.replace('/explore')} aoMudarAba={mudarAba}
    aoSelecionar={ponto => router.replace({ pathname: '/place/[id]', params: { id: ponto.id } })} /></Protegida>;
}
