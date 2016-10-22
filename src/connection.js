import warning from 'warning';

export const MODE_WS = 'MODE_WS';
export const MODE_REST = 'MODE_REST';

function isWebSocketSupported() {
  return !!(window && window.WebSocket);
}

function notifyConnectionChange(connection, newConnectionMode) {
  const oldConnectionMode = connection.connectionMode;
  connection.connectionMode = newConnectionMode;
  if (oldConnectionMode !== newConnectionMode) {
    connection.onConnectionChange(newConnectionMode);
  }
}

class Connection {
  constructor(options, callbacks) {
    this.apiUrl = options.apiUrl || new Error('Must provide a url for the backend api');
    this.socketUrl = options.socketUrl || this.apiUrl;
    this.callbackMap = {};
    this.callbacks = callbacks;
    this.onConnectionChange = options.onConnectionChange;

    const WebSocket = options.ws || (isWebSocketSupported() ? window.WebSocket : null);

    if (WebSocket) {
      this.useWS(WebSocket);
    } else {
      this.useREST();
    }
  }

  registerCallback(path, cb) {
    if (this.callbackMap[path]) {
      this.callbackMap[path].push(cb);
    } else {
      this.callbackMap[path] = [cb];
    }
  }

  useWS(WebSocket) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    const socket = new WebSocket(`ws://${this.socketUrl}`);
    socket.onerror = () => this.useREST();
    socket.onmessage = (event) => {
      const responseData = JSON.parse(event.data);
      this.triggerCallback(responseData.type, responseData.data);
    };
    socket.onclose = () => this.useREST();

    this.socket = socket;

    notifyConnectionChange(this, MODE_WS);
  }

  useREST() {
    notifyConnectionChange(this, MODE_REST);
  }

  isWS() {
    return this.connectionMode === MODE_WS;
  }

  isREST() {
    return this.connectionMode === MODE_REST;
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
