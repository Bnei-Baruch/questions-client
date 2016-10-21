import warning from 'warning';


function isWebSocketSupported() {
  return !!(window && window.WebSocket);
}

const defaults = {
  pollInterval: 10 * 1000 // 10 seconds
};

class Connection {
  constructor(options) {
    this.apiUrl = options.apiUrl || new Error('Must provide a url for the backend api');
    this.socketUrl = options.socketUrl || this.apiUrl;

    const WebSocket = options.ws || (isWebSocketSupported() ? window.WebSocket : null);

    if (WebSocket) {
      this.socket = new WebSocket(`ws://${this.socketUrl}`);
    }

    if (!this.socket) {
      this.setMode('poll');
    } else {
      this.setMode('ws');
    }
  }

  setMode(mode) {
    switch (mode) {
      case 'ws':
      case 'poll':
        this.mode = mode;
        break;
      default:
        warning(false, `bad connection mode supplied (${mode}): setting default mode: poll`);
        this.mode = 'poll';
    }
  }
}

export default Connection;