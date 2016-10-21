// import config from './config.js';
import Connection from './Connection';

class QuestionsClient {
  constructor(options) {
    if (!(this instanceof QuestionsClient)) {
      return new QuestionsClient(options);
    }

    this.connection = new Connection(options);
  }

  sendQuestion({ name, from, message } = {}) {
    return this.connection.sendQuestion({ name, from, message});
  }

  getQuestions() {
    return this.connection.getQuestions();
  }
}

export default QuestionsClient;
