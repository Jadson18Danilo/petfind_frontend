export function showToast(message, type = 'info', duration = 2800) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: { message, type, duration },
    })
  );
}
