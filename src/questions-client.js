import config from './config.js';
import Connection, { MODE_REST, MODE_WS } from './connection';

class QuestionsClient {
  constructor(options) {
    if (!(this instanceof QuestionsClient)) {
      return new QuestionsClient(options);
    }

    this.pollInterval = options.pollInterval || config.client.pollInterval;
    this.pollHandle = null;
    this.lastDateReceivedNewQuestions = null;

    const startPolling = () => {
      this.pollHandle = setTimeout(
          () => this.connection.request('getNewQuestions', { since: this.lastDateReceivedNewQuestions }),
          this.pollInterval
        );
    };

    const stopPolling = () => {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    };

    const connectionOptions = {
      apiUrl: options.apiUrl,
      onConnectionChange: (mode) => {
        if (mode === MODE_REST) {
          startPolling();
        } else if (mode === MODE_WS) {
          stopPolling();
        }
      }
    };

    const callbacks = {
      onQuestionApproved: options.onQuestionApproved,
      onQuestionsReceived: (data) => {
        this.lastDateReceivedNewQuestions = Date.now();
        options.onQuestionsReceived(data);
      },
      onNewQuestionsReceived: (data) => {
        this.lastDateReceivedNewQuestions = Date.now();
        options.onNewQuestionsReceived(data);
      }
    };

    this.connection = new Connection(connectionOptions, callbacks);

    this.connection.registerCallback('sendQuestion', 'onQuestionApproved');
    this.connection.registerCallback('getQuestions', 'onQuestionsReceived');
    this.connection.registerCallback('getNewQuestions', 'onNewQuestionsReceived');
  }

  sendQuestion({ name, from, message } = {}) {
    return this.connection.request('sendQuestion', { name, from, message }, { method: 'POST' });
  }

  getQuestions() {
    return this.connection.request('getQuestions', null, { method: 'GET' });
  }
}

export default QuestionsClient;
