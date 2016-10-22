import warning from 'warning';

const MODE_WS = 'MODE_WS';
const MODE_POLLING = 'MODE_POLLING';

function isWebSocketSupported() {
  return !!(window && window.WebSocket);
}

const defaults = {
  pollInterval: 10 * 1000, // 10 seconds
  connectionMode: MODE_POLLING
};

class Connection {
  constructor(options, callbacks) {
    this.apiUrl = options.apiUrl || new Error('Must provide a url for the backend api');
    this.socketUrl = options.socketUrl || this.apiUrl;
    this.pollInterval = options.pollInterval || defaults.pollInterval;
    this.callbackMap = {};
    this.callbacks = callbacks;

    const WebSocket = options.ws || (isWebSocketSupported() ? window.WebSocket : null);

    if (WebSocket) {
      this.useWs(WebSocket);
    } else {
      this.usePolling();
    }
  }

  registerCallback(path, cb) {
    if (this.callbackMap[path]) {
      this.callbackMap[path].push(cb);
    } else {
      this.callbackMap[path] = [cb];
    }
  }

  useWs(WebSocket) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.close();
    }

    const socket = new WebSocket(`ws://${this.socketUrl}`);
    socket.onerror = () => this.usePolling();
    socket.onmessage = (event) => {
      const responseData = JSON.parse(event.data);
      this.triggerCallback(responseData.type, responseData.data);
    };
    socket.onclose = () => this.usePolling();

    this.socket = socket;
    this.setMode(MODE_WS);
  }

  usePolling() {
    // TODO: use polling!
    this.setMode(MODE_POLLING);
  }

  isWs() {
    return this.connectionMode === MODE_WS;
  }

  isPolling() {
    return this.connectionMode === MODE_POLLING;
  }

  setMode(mode) {
    switch (mode) {
      case MODE_WS:
      case MODE_POLLING:
        this.connectionMode = mode;
        break;
      default:
        warning(false, `bad connection mode supplied (${mode}): setting default mode: ${defaults.connectionMode}`);
        this.connectionMode = defaults.connectionMode;
    }
  }

  createSocketMessage(type, data) {
    return JSON.stringify({ type, data });
  }

  sendSocketMessage(message) {
    return this.socket.send(message);
  }

  triggerCallback(cbName, data) {
    const cb = this.callbacks[cbName];
    if (cb) {
      return cb(data);
    }

    warning(false, `calling callback ${cbName}, but it does not exist`);
    return null;
  }

  request(path, data, meta) {
    if (this.isWs()) {
      return this.sendSocketMessage(this.createSocketMessage(path, data));
    }

    return fetch(
      path,
      Object.assign({}, meta, { body: JSON.stringify(data) })
    ).then(response => response.json())
    .then(response => {
      if (response.status === 200) {
        const callbackNames = [].concat(this.callbackMap(path) || []);
        for (const cbName of callbackNames) {
          this.triggerCallback(cbName, response.body);
        }
      }
    });
  }
}

export default Connection;
