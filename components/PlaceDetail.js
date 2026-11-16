import PlaceExperience from './PlaceExperience';

export default function PlaceDetail({ local = null, pontoId = null, aoVoltar, aoMudarAba, aoSelecionar }) {
  return <PlaceExperience localInicial={local} pontoId={pontoId} aoVoltar={aoVoltar} aoMudarAba={aoMudarAba} aoSelecionar={aoSelecionar} />;
}
