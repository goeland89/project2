document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on('connect', ()=> {
    if (localStorage.username) {
      window.location.href = "/channels";
    }
  });

  document.getElementById('registration').onclick = () => {
      console.log('registration')
      const username = document.getElementById('username').value;
      socket.emit('check_registration', {'username': username});
  };

  socket.on('user_already_exists', () => {
    document.getElementById('login_message').innerHTML = "Username already exists. Please select another one."
  });

  socket.on('login', username => {
    localStorage.setItem('username', username);
    window.location.href = "/channels";
  });

});
