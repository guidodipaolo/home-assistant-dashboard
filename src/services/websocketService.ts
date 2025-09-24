import { homeAssistantAPI } from "./homeAssistantApi";

export interface WebSocketMessage {
  id?: number;
  type: string;
  [key: string]: any;
}

export interface StateChangedEvent {
  type: "event";
  event: {
    event_type: "state_changed";
    data: {
      entity_id: string;
      old_state: any;
      new_state: any;
    };
  };
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  error?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private messageId = 1;
  private pendingMessages = new Map<
    number,
    { resolve: Function; reject: Function }
  >();
  private eventListeners = new Map<string, Set<Function>>();
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    isConnecting: false,
  };
  private statusListeners = new Set<(status: ConnectionStatus) => void>();

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const config = homeAssistantAPI.getConfig();

    // If wsUrl is provided and already includes /api/websocket, use it as is
    if (config.wsUrl && config.wsUrl.includes("/api/websocket")) {
      return config.wsUrl;
    }

    // If wsUrl is provided but doesn't include /api/websocket, add it
    if (config.wsUrl) {
      return `${config.wsUrl}/api/websocket`;
    }

    // Fallback: convert HTTP URL to WebSocket URL and add /api/websocket
    const wsUrl = config.url.replace("http", "ws");
    return `${wsUrl}/api/websocket`;
  }

  private connect(): void {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.updateConnectionStatus({ isConnecting: true, error: undefined });

    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected to Home Assistant");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.updateConnectionStatus({
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
          error: undefined,
        });
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        this.updateConnectionStatus({
          isConnected: false,
          isConnecting: false,
          error: `Connection closed: ${event.reason || "Unknown reason"}`,
        });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.updateConnectionStatus({
          isConnected: false,
          isConnecting: false,
          error: "Connection error occurred",
        });
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.updateConnectionStatus({
        isConnected: false,
        isConnecting: false,
        error: "Failed to create connection",
      });
      this.scheduleReconnect();
    }
  }

  private authenticate(): void {
    const config = homeAssistantAPI.getConfig();
    console.log("Attempting WebSocket authentication...");
    console.log("Token length:", config.token ? config.token.length : 0);
    console.log(
      "Token starts with:",
      config.token ? config.token.substring(0, 10) + "..." : "No token"
    );

    // Send auth message directly without ID (auth messages don't need IDs)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const authMessage = {
        type: "auth",
        access_token: config.token,
      };
      console.log("Sending auth message:", authMessage);
      this.ws.send(JSON.stringify(authMessage));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      this.updateConnectionStatus({
        isConnected: false,
        isConnecting: false,
        error: "Max reconnection attempts reached",
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`
    );
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private sendMessage(message: WebSocketMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket is not connected"));
        return;
      }

      const id = this.messageId++;
      const messageWithId = { ...message, id };

      this.pendingMessages.set(id, { resolve, reject });

      try {
        this.ws.send(JSON.stringify(messageWithId));
      } catch (error) {
        this.pendingMessages.delete(id);
        reject(error);
      }
    });
  }

  private handleMessage(data: any): void {
    // Handle authentication response
    if (data.type === "auth_ok") {
      console.log("WebSocket authentication successful");
      this.subscribeToEvents();
      return;
    }

    if (data.type === "auth_invalid") {
      console.error("WebSocket authentication failed");
      console.error("Auth error details:", data);
      this.updateConnectionStatus({
        isConnected: false,
        isConnecting: false,
        error: `Authentication failed: ${data.message || "Invalid token"}`,
      });
      return;
    }

    // Handle response messages
    if (data.id && this.pendingMessages.has(data.id)) {
      const { resolve, reject } = this.pendingMessages.get(data.id)!;
      this.pendingMessages.delete(data.id);

      if (data.success) {
        resolve(data.result);
      } else {
        reject(new Error(data.error?.message || "Unknown error"));
      }
      return;
    }

    // Handle event messages
    if (data.type === "event") {
      this.handleEvent(data);
    }
  }

  private handleEvent(data: any): void {
    const eventType = data.event?.event_type;
    if (eventType) {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.forEach((listener) => {
          try {
            listener(data);
          } catch (error) {
            console.error("Error in event listener:", error);
          }
        });
      }
    }
  }

  private subscribeToEvents(): void {
    this.sendMessage({
      type: "subscribe_events",
      event_type: "state_changed",
    }).catch((error) => {
      console.error("Failed to subscribe to state_changed events:", error);
    });
  }

  private updateConnectionStatus(updates: Partial<ConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...updates };
    this.statusListeners.forEach((listener) => {
      try {
        listener(this.connectionStatus);
      } catch (error) {
        console.error("Error in status listener:", error);
      }
    });
  }

  // Public methods
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public onConnectionStatusChange(
    callback: (status: ConnectionStatus) => void
  ): () => void {
    this.statusListeners.add(callback);
    // Call immediately with current status
    callback(this.connectionStatus);

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public onEvent(eventType: string, callback: Function): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
        }
      }
    };
  }

  public onStateChanged(
    callback: (event: StateChangedEvent) => void
  ): () => void {
    return this.onEvent("state_changed", callback);
  }

  public async getStates(): Promise<any[]> {
    return this.sendMessage({
      type: "get_states",
    });
  }

  public async getState(entityId: string): Promise<any> {
    return this.sendMessage({
      type: "get_states",
    }).then((states) => {
      return states.find((state: any) => state.entity_id === entityId);
    });
  }

  public async callService(
    domain: string,
    service: string,
    serviceData?: any
  ): Promise<any> {
    return this.sendMessage({
      type: "call_service",
      domain,
      service,
      service_data: serviceData || {},
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateConnectionStatus({
      isConnected: false,
      isConnecting: false,
    });
  }

  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public getDebugInfo(): any {
    const config = homeAssistantAPI.getConfig();
    return {
      config: {
        url: config.url,
        wsUrl: config.wsUrl,
        hasToken: !!config.token,
        tokenLength: config.token ? config.token.length : 0,
        tokenPreview: config.token
          ? config.token.substring(0, 10) + "..."
          : "No token",
      },
      connection: {
        isConnected: this.connectionStatus.isConnected,
        isConnecting: this.connectionStatus.isConnecting,
        error: this.connectionStatus.error,
        lastConnected: this.connectionStatus.lastConnected,
        reconnectAttempts: this.reconnectAttempts,
      },
      websocket: {
        readyState: this.ws?.readyState,
        url: this.getWebSocketUrl(),
      },
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
