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

  socket.on('registered1', users => {
    console.log('update list of users');
    document.getElementById('user_list').innerHTML = '';
    for (user in users) {
      display_user(user);
    }
  });

  socket.on('registered2', (channels, users) => {
    console.log('registered');
    for (channel_name in channels) {
      create_channel(channel_name);
    }
    if (localStorage.room) {
      socket.emit('join', {'channel_name': localStorage.room});
    }
  });

  socket.on('user_already_exists', () => {
    logout();
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
    socket.emit('disco', {'username': localStorage.username})
    logout();
  };

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
      localStorage.setItem('room', channel_name);
      socket.emit('join', {'channel_name': channel_name});
    };
  };

  socket.on('joined_room', (channel_name, content) => {
    console.log('joined room');
    //save channelroom in which the user has entered
    localStorage.setItem('room', channel_name);
    window.location.href = "/channel";
  });

  socket.on('no_such_channel', () => {
    console.log('no such channel');
    localStorage.removeItem('room');
  });

  function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('room');
    socket.disconnect();
    // go back to the login page
    window.location.href = "/";
  };

  function display_user(user_name) {
    const newUser = document.createElement('li');
    const newLink = document.createElement('a');
    newLink.href = '#';
    newLink.innerHTML = user_name;
    newLink.id = user_name;
    newUser.append(newLink);
    document.getElementById('user_list').append(newUser);

    newLink.onclick = () => {
      const user_name = newLink.id;
      console.log(user_name);
      if(user_name == localStorage.username) {
        document.getElementById('new_user_message').innerHTML = 'You have selected yourself. Select another user.';
      } else {
        document.getElementById('new_user_message').innerHTML = '';
        //TO DO: build private chat
        socket.emit('privateChat', {'channel_name': user_name});
      }
    };
  };

});
