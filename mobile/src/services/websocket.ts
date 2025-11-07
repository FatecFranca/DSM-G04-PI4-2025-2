import { Table, Call } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: ((data: any) => void)[] = [];

  connect(url: string) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Implement reconnection logic here
      setTimeout(() => this.connect(url), 5000);
    };
  }

  addListener(listener: (data: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data));
  }

  updateCallStatus(callId: string, status: Call['status']) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'UPDATE_CALL',
        payload: { callId, status }
      }));
    }
  }
}

export const wsService = new WebSocketService();