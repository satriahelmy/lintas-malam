export type AppScreen = 'boot' | 'loading' | 'main-menu' | 'gameplay';

export function setAppStatus(label: string, screen: AppScreen): void {
  const status = document.querySelector<HTMLElement>('#app-status');
  if (!status) return;

  status.textContent = label;
  status.dataset.screen = screen;
  document.title = `Lintas Malam — ${label}`;
}
