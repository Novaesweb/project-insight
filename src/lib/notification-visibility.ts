export const DISABLED_NOTIFICATION_URL_PREFIXES = ["/admin/contratos", "/cliente/contratos"] as const;

type NotificationWithOptionalUrl = {
  url?: string | null;
};

export function isVisibleNotificationUrl(url?: string | null) {
  if (!url) return true;
  return !DISABLED_NOTIFICATION_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function isVisibleNotification<T extends NotificationWithOptionalUrl>(notification: T) {
  return isVisibleNotificationUrl(notification.url);
}
