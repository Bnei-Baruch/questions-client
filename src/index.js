import QuestionsClient from './questions-client';

const client = new QuestionsClient({
  url: 'http://localhost:8000'
});

client.client.subscribe('/sendQuestion', (a) => console.log(a)).then(() => {
  client.sendQuestion({
    name: 'yaniv',
    from: 'haifa',
    message: 'hi im testing'
  }).then(() => console.log('message was send successfuly'))
  .catch(error => console.log(error));
});
