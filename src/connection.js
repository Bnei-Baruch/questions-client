import warning from 'warning';

const MODE_WS = 'MODE_WS';
const MODE_POLLING = 'MODE_POLLING';

// TODO: make websocket fallback to polling/rest when it fails
// TODO: seperate request and response
// TODO: seperate logic functions from Connection
// TODO: add socket events

function isWebSocketSupported() {
  return !!(window && window.WebSocket);
}

const defaults = {
  pollInterval: 10 * 1000, // 10 seconds
  connectionMode: MODE_POLLING
};

class Connection {
  constructor(options) {
    this.apiUrl = options.apiUrl || new Error('Must provide a url for the backend api');
    this.socketUrl = options.socketUrl || this.apiUrl;
    this.pollInterval = options.pollInterval || defaults.pollInterval;

    const WebSocket = options.ws || (isWebSocketSupported() ? window.WebSocket : null);

    if (WebSocket) {
      this.socket = new WebSocket(`ws://${this.socketUrl}`);
    }

    if (this.socket) {
      this.useWs();
    } else {
      this.usePolling();
    }
  }

  useWs() {
    this.setMode(MODE_WS);
  }

  usePolling() {
    this.setMode(MODE_POLLING)
  }

  isWs() {
    return this.mode === MODE_WS;
  }

  isPolling() {
    return this.mode === MODE_POLLING;
  }

  setMode(mode) {
    switch (mode) {
      case MODE_WS:
      case MODE_POLLING:
        this.mode = mode;
        break;
      default:
        warning(false, `bad connection mode supplied (${mode}): setting default mode: ${defaults.connectionMode}`);
        this.mode = defaults.connectionMode;
    }
  }

  createSocketMessage(type, data) {
    return JSON.stringify({ type, data });
  }

  sendSocketMessage(message) {
    return this.socket.send(message);
  }

  sendQuestion({ name, from, message } = {}) {
    if (this.isWs()) {
      return this.sendSocketMessage(createSocketMessage('sendQuestion', { name, from, message }));
    } else if (this.isPolling()) {
      return fetch(`${apiUrl}/sendQuestion`, {
        method: 'POST',
        body: JSON.stringify({ name, from, message })
      }).then(response => response.json())
      .then(data => {
        console.log(data);
      }).catch(error => {
        console.log(error);
      });
    }

  }

  getQuestions() {
    if (this.isWs()) {
      return this.sendSocketMessage(createSocketMessage('getQuestions'))
    } else if (this.isPolling()) {
      return fetch(`${apiUrl}/getQuestions`, {
        method: 'GET',
      }).then(response => response.json())
      .then(data => {
        console.log(data);
      }).catch(error => {
        console.log(error);
      });
    }
  }
}

export default Connection;