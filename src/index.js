// import config from './config.js';
import Connection from './Connection';

class QuestionsClient {
  constructor(options) {
    if (!(this instanceof QuestionsClient)) {
      return new QuestionsClient(options);
    }

    this.connection = new Connection(options, {
      onQuestionApproved: options.onQuestionApproved,
      onQuestionsReceived: options.onQuestionsReceived
    });

    this.connection.registerCallback('sendQuestion', 'onQuestionApproved');
    this.connection.registerCallback('getQuestions', 'onQuestionsReceived');
  }

  sendQuestion({ name, from, message } = {}) {
    return this.connection.request('sendQuestion', { name, from, message }, { method: 'POST' });
  }

  getQuestions() {
    return this.connection.request('getQuestions', null, { method: 'GET' });
  }
}

export default QuestionsClient;
