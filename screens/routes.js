import { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { adaptarPonto } from '../services/adapters';
import { avisar } from '../services/notify';
const Login = carregarTela(() => import('../components/Login'));
const Register = carregarTela(() => import('../components/Register'));
const Home = carregarTela(() => import('../components/Home'));
const Explore = carregarTela(() => import('../components/Explore'));
const Profile = carregarTela(() => import('../components/Profile'));
const Itinerary = carregarTela(() => import('../components/Itinerary'));
const PlaceDetail = carregarTela(() => import('../components/PlaceDetail'));

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
export function ExploreScreen() { return <Protegida><Explore aoMudarAba={mudarAba} aoAbrirLocal={abrirLocal} /></Protegida>; }
export function ItineraryScreen() { return <Protegida><Itinerary aoMudarAba={mudarAba} /></Protegida>; }
export function ProfileScreen() {
  const { user, favoritos, logout, salvarInteresses } = useApp();
  const sair = async () => { try { await logout(); router.replace('/login'); } catch (err) { avisar('Sair da conta', err.message); } };
  return <Protegida><Profile nome={user?.name} email={user?.email} favoritos={favoritos} interesses={user?.interesses} aoAbrirLocal={abrirLocal} aoSalvarInteresses={salvarInteresses} aoMudarAba={mudarAba} aoSair={sair} /></Protegida>;
}
export function PlaceScreen() {
  const { id } = useLocalSearchParams();
  const { pontos, user } = useApp();
  const inicial = pontos.find(p => p.id === id);
  const [detalhe, setDetalhe] = useState(null);
  useEffect(() => {
    if (!user || typeof id !== 'string') return;
    let ativo = true;
    api.ponto(id).then(r => { if (ativo) setDetalhe(adaptarPonto(r.ponto)); }).catch(err => { if (ativo) { avisar('Local', err.message); if (!inicial) router.replace('/explore'); } });
    return () => { ativo = false; };
  }, [id, user, inicial]);
  const local = detalhe?.id === id ? detalhe : inicial;
  return <Protegida>{local ? <PlaceDetail key={local.id} local={local} aoVoltar={() => router.canGoBack() ? router.back() : router.replace('/explore')} aoMudarAba={mudarAba} /> : null}</Protegida>;
}
