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

  document.getElementById('leave').onclick = () => {
    console.log('leave');
    localStorage.removeItem('room');
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
    window.location.href = "/channels";
  };

});
