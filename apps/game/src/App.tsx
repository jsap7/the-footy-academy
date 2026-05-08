import Game from './Game';
import Landing from './Landing';
import { useRoute } from './util/router';

export default function App() {
  const route = useRoute();
  return route === 'game' ? <Game /> : <Landing />;
}
