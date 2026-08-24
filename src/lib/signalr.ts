import * as signalR from '@microsoft/signalr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api';
const HUB_URL = API_URL.replace(/\/api$/, '') + '/hubs/notifications';

let connection: signalR.HubConnection | null = null;
const listeners = new Set<(notification: any) => void>();

export function getSignalRConnection(): signalR.HubConnection | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('wm_token');
  if (!token) return null;

  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('wm_token') || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification: any) => {
      listeners.forEach((listener) => listener(notification));
    });

    connection.start().catch((err) => {
      console.warn('SignalR connection failed:', err);
    });

    connection.onclose(() => {
      connection = null;
    });
  } else if (connection.state === signalR.HubConnectionState.Disconnected) {
    connection.start().catch((err) => {
      console.warn('SignalR reconnection failed:', err);
    });
  }

  return connection;
}

export function subscribeNotifications(callback: (notification: any) => void) {
  listeners.add(callback);
  getSignalRConnection();

  return () => {
    listeners.delete(callback);
  };
}

export function stopSignalRConnection() {
  if (connection) {
    connection.stop().catch(() => {});
    connection = null;
  }
}
