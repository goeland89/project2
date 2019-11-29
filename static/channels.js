//localStorage.debug = '*';

document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, the user can register his username
  socket.on('connect', () => {
    if (localStorage.username) {
      console.log('register');
      document.getElementById('welcome').innerHTML = `Welcome ${localStorage.username}`;
      socket.emit('register');
    }
    else {
      console.log('no local storage');
      logout();
    }
  });

  socket.on('registered', channels => {
    console.log('registered');
    for (channel_name in channels) {
      create_channel(channel_name);
    }
    if (localStorage.room) {
      socket.emit('join', {'channel_name': localStorage.room});
    }
  });

  document.getElementById('createnewchannel').onclick = () => {
    console.log('new channel created');
    const channel_name = document.getElementById('new_channel_name').value;
    socket.emit('newchannel', {'channel_name': channel_name});
  };

  socket.on('channel_already_exists', () => {
    document.getElementById('new_channel_message').innerHTML = "Channel already exists";
  });

  socket.on('channel_created', channel_name => {
    document.getElementById('new_channel_message').innerHTML = "Channel has been created";
    create_channel(channel_name);
  });

  document.getElementById('disco').onclick = () => {
    console.log('disco');
    localStorage.removeItem('username');
    logout();
  };

  socket.on('joined_room', (channel_name, content) => {
    console.log('joined room');
    //save channelroom in which the user has entered
    localStorage.setItem('room', channel_name);
    load_room(content);
  });

  socket.io('new_message_sent', content => {
    load_room(content);
  });

  function create_channel(channel_name) {
    const newChannel = document.createElement('li');
    const newLink = document.createElement('a');
    newLink.href = '#';
    newLink.innerHTML = channel_name;
    newLink.id = channel_name;
    newChannel.append(newLink);
    document.getElementById('channel_list').append(newChannel);

    newLink.onclick = () => {
      const channel_name = newLink.id;
      console.log(channel_name);
      socket.emit('join', {'channel_name': channel_name});
    };
  };

  function load_room(content, channe_name) {
    console.log('room loaded');
    const newTitle = document.createElement('h1');
    newTitle.innerHTML = 'You are in '+ localStorage.room;
    const newTextArea = document.createElement('textarea');
    newTextArea.cols = 100;
    newTextArea.row = 50;
    newTextArea.innerHTML = content;
    const newMessageContainer = document.createElement('input');
    newMessageContainer.type = 'text';
    newMessageContainer.size = 100;
    newMessageContainer.id = 'new_message';
    newMessageContainer.placeholder = 'Type your message...'
    const newSendMessage = document.createElement('button');
    newSendMessage.innerHTML = 'Send';
    const leaveRoom = document.createElement('a');
    leaveRoom.innerHTML = 'Leave room';
    leaveRoom.href = '#';
    document.getElementById('channelroom').append(newTitle);
    document.getElementById('channelroom').append(newTextArea);
    document.getElementById('channelroom').append(newMessageContainer);
    document.getElementById('channelroom').append(newSendMessage);
    document.getElementById('channelroom').append(leaveRoom);

    newSendMessage.onclick = () => {
      //il faut ajouter le timestamp
      const newContent = `${localStorage.username}:` +
        document.getElementById('new_message').value;
      socket.emit('new_message', {'content': newContent, 'channel_name': localStorage.room});
    };

    leaveRoom.onclick = () => {
      localStorage.removeItem('room');
      //supprimer tous les éléments créés
    };
  };

  function logout() {
    socket.disconnect();
    // go back to the login page
    window.location.href = "/";
  };

});
