import './styles/ui.css';

import { MIN_VIEWPORT_HEIGHT, MIN_VIEWPORT_WIDTH } from './game/game-config';
import { createGame } from './game/create-game';

function updateResolutionNotice(): void {
  const notice = document.querySelector<HTMLElement>('#resolution-notice');
  if (!notice) return;

  const isTooSmall = window.innerWidth < MIN_VIEWPORT_WIDTH || window.innerHeight < MIN_VIEWPORT_HEIGHT;
  notice.hidden = !isTooSmall;
}

window.addEventListener('resize', updateResolutionNotice);
updateResolutionNotice();
createGame();
