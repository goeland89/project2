document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, the user can register his username
  socket.on('connect', () => {
    if (!localStorage.username) {
      leaveChannel();
    }
    if (localStorage.room) {
      document.getElementById('welcome').innerHTML = `Welcome ${localStorage.username}. You are connected to ${localStorage.room}`;
      socket.emit('connected_to_room', {'channel_name': localStorage.room});
    } else {
      console.log('no local storage');
      leaveChannel();
    }
  });

  document.getElementById('leave').onclick = () => {
    console.log('leave');
    leaveChannel();
  };

  document.getElementById('send').onclick = () => {
    //il faut ajouter le timestamp
    const d = new Date();
    const newContent = "(" + d.toDateString() + ")"+ `${localStorage.username}:` +
      document.getElementById('new_message').value;
    document.getElementById('new_message').value = "";
    socket.emit('new_message', {'content': newContent, 'channel_name': localStorage.room});

  };

  socket.on('new_message_sent', (channel_name, channelContent) => {
    console.log("new message sent");
    if (channel_name == localStorage.room) {
      displayMessages(channelContent["messages"]);
    }
  });

  socket.on('no_such_room', () => {
    leaveChannel();
  });

  socket.on('open_room', channelContent => {
    console.log("room open");
    displayMessages(channelContent["messages"]);
  });

  function leaveChannel() {
    localStorage.removeItem('room');
    socket.disconnect();
    // go back to the login page
    window.location.href = "/channels";
  };

  function displayMessages(messages) {
    var message, content = '';
    for (message in messages) {
      content = content + messages[message] + '\n'
    }
    document.getElementById('chat').innerHTML = content;
  };

});
