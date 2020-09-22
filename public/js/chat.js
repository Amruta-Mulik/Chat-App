let socket = io();

function scrollToBottom() {
  let messages = document.querySelector('#messages').lastElementChild;
  messages.scrollIntoView();
}

socket.on('connect', function() {
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');

  // chat__sidebar
  let sidebar = document.querySelector('#chat__sidebar');
  sidebar.innerHTML = "";
  let title = document.createElement('h3');
  title.innerHTML = params.name;

  sidebar.appendChild(title);

  socket.emit('join', params, function(err) {
    if(err){
      alert(err);
      window.location.href = '/';
    }else {
      console.log('No Error');
    }
  })

});

socket.on('disconnect', function() {
  console.log('disconnected from server.');
});



socket.on('chat', function(msg) {
  let message = JSON.parse(msg);
  const formattedTime = moment(message.createdAt).format('LT');
  const query = message.from == 'Admin' ? '#notification-template' : '#message-template';

  const template = document.querySelector(query).innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });

  const div = document.createElement('div');
  div.innerHTML = html

  document.querySelector('#messages').appendChild(div);
  scrollToBottom();
});



document.querySelector('#submit-btn').addEventListener('click', function(e) {
  e.preventDefault();

  socket.emit("createMessage", {
    text: document.querySelector('input[name="message"]').value
  }, function() {
    document.querySelector('input[name="message"]').value = '';
  })
})


