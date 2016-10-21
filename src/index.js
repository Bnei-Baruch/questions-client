// import config from './config.js';
import Connection from './Connection';

class QuestionsClient {
  constructor(options) {
    if (!(this instanceof QuestionsClient)) {
      return new QuestionsClient(options);
    }

    this.connection = new Connection();

    this.pollInterval = options.pollInterval || defaults.pollInterval;
  }

  sendQuestion({ name, from, message } = {}) {
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

  getQuestions() {
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

export default QuestionsClient;
