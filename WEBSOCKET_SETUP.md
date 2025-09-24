# WebSocket Configuration for Home Assistant Dashboard

## Overview

This dashboard now includes a WebSocket connection to Home Assistant that provides real-time updates and connection status monitoring. The WebSocket service automatically handles authentication, reconnection, and event subscription.

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Home Assistant Configuration
REACT_APP_HA_URL=http://192.168.1.100:8123
REACT_APP_HA_TOKEN=your_long_lived_access_token_here
REACT_APP_HA_WS_URL=ws://192.168.1.100:8123
```

**Important Notes:**

- Replace `192.168.1.100:8123` with your Home Assistant server IP and port
- The `REACT_APP_HA_WS_URL` can be configured in two ways:
  - **Option 1**: Base URL without `/api/websocket` (recommended) - e.g., `ws://192.168.1.100:8123`
  - **Option 2**: Full WebSocket URL with `/api/websocket` - e.g., `ws://192.168.1.100:8123/api/websocket`
- Use `ws://` for HTTP connections and `wss://` for HTTPS connections
- If `REACT_APP_HA_WS_URL` is not provided, it will be automatically generated from `REACT_APP_HA_URL`

### 2. Home Assistant Token

1. Go to your Home Assistant profile (click on your avatar in the bottom left)
2. Scroll down to "Long-lived access tokens"
3. Click "Create token"
4. Give it a name like "Dashboard WebSocket"
5. Copy the token and paste it in your `.env` file

## Features

### Connection Status

- **Connected**: Green indicator - WebSocket is active and authenticated
- **Connecting**: Orange indicator - Attempting to connect
- **Disconnected**: Red indicator - Connection lost or failed
- **Reconnect Button**: Click the 🔄 button to manually reconnect

### Real-time Updates

- The WebSocket automatically subscribes to `state_changed` events
- All entity state changes are received in real-time
- No need to poll the API for updates

### Automatic Reconnection

- Automatically attempts to reconnect if connection is lost
- Uses exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
- Maximum of 5 reconnection attempts before giving up

## Usage

### Using the WebSocket Hook

```typescript
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

const MyComponent = () => {
  const { isConnected, isConnecting, error, lastConnected, reconnect } =
    useWebSocketConnection();

  return (
    <div>
      Status: {isConnected ? "Connected" : "Disconnected"}
      {error && <div>Error: {error}</div>}
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
};
```

### Using the WebSocket Service Directly

```typescript
import { websocketService } from "../services/websocketService";

// Subscribe to state changes
const unsubscribe = websocketService.onStateChanged((event) => {
  console.log("State changed:", event);
});

// Get current states
const states = await websocketService.getStates();

// Call a service
await websocketService.callService("light", "turn_on", {
  entity_id: "light.living_room",
});

// Cleanup
unsubscribe();
```

## Testing

A test component (`WebSocketTest`) is included in the dashboard to help verify the connection:

- Shows connection status
- Displays last state change event
- Allows testing connection and fetching states
- Shows sample entity states

**Note**: Remove the `<WebSocketTest />` component from `Layout.tsx` before deploying to production.

## Troubleshooting

### Connection Issues

1. **Check your Home Assistant URL**: Make sure the IP address and port are correct
2. **Verify the token**: Ensure the long-lived access token is valid and has proper permissions
3. **Check network connectivity**: Ensure your device can reach the Home Assistant server
4. **Check Home Assistant logs**: Look for any WebSocket-related errors in the Home Assistant logs

### Common Errors

- **Authentication failed**: Check your token in the `.env` file
- **Connection refused**: Verify the Home Assistant server is running and accessible
- **WebSocket URL mismatch**: Ensure `REACT_APP_HA_WS_URL` uses the correct protocol (ws:// or wss://)

### Browser Console

Check the browser console for detailed error messages and connection logs. The WebSocket service logs all connection attempts, authentication results, and errors.

## Security Notes

- Never commit your `.env` file to version control
- Use HTTPS/WSS in production environments
- Regularly rotate your long-lived access tokens
- Consider using Home Assistant's built-in authentication for production deployments
