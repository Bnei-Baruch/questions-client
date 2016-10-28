import config from './config';
import Faye from 'faye';
import { isFunction } from './utils';

// TODO (yaniv): question approved should only be received on a specific channel for the user client

class QuestionsClient {
  constructor(options) {
    this.apiUrl = options.url;
    this.client = Faye.Client(this.apiUrl, { retry: config.retry });

    if (isFunction(options.onQuestionApproved)) {
      this.client.subscribe('/onQuestionApproved', options.onQuestionApproved);
    }

    if (isFunction(options.onQuestionsReceived)) {
      this.client.subscribe('/onQuestionsReceived', options.onQuestionsReceived);
    }

    if (isFunction(options.onNewQuestionsReceived)) {
      this.client.subscribe('/onNewQuestionsReceived', options.onNewQuestionsReceived);
    }
  }

  sendQuestion({ name, from, message } = {}) {
    return this.client.publish('/sendQuestion', { name, from, message });
  }

  getQuestions() {
    return this.client.publish('/getQuestions');
  }
}

export default QuestionsClient;
