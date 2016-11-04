import config from './config';
import Faye from 'faye';
import { isFunction } from './utils';

// TODO (yaniv):
// onQuestionApproved and onQuestionsReceived should only be received on a specific channel for the user client

class QuestionsClient {
  constructor(options) {
    this.apiUrl = options.url;
    const client = new Faye.Client(this.apiUrl + config.fayePrefix, { retry: config.retry });

    if (options.ajaxOnly) {
      client.disable('websocket');
    }

    if (isFunction(options.onQuestionApproved)) {
      client.subscribe('/onQuestionApproved', options.onQuestionApproved);
    }

    if (isFunction(options.onQuestionsReceived)) {
      client.subscribe('/onQuestionsReceived', options.onQuestionsReceived);
    }

    if (isFunction(options.onNewQuestionsReceived)) {
      client.subscribe('/onNewQuestionsReceived', options.onNewQuestionsReceived);
    }

    this.client = client;
  }

  sendQuestion({ name, from, message } = {}) {
    return this.client.publish('/sendQuestion', { name, from, message }, { attempts: config.attempts });
  }

  getQuestions() {
    return this.client.publish('/getQuestions', { attempts: config.attempts });
  }
}

export default QuestionsClient;
