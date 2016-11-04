import QuestionsClient from './questions-client';

const client = new QuestionsClient({
  url: 'http://localhost:8000'
});

// client.client.subsrcibe('/sendQuestion', (a) => alert(a));

client.sendQuestion({
  name: 'yaniv',
  from: 'haifa',
  message: 'hi im testing'
}).then((data) => console.log(data))
.catch(error => console.log(error));

