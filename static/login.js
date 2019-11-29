//localStorage.debug = '*';

document.addEventListener('DOMContentLoaded', () => {

  if (localStorage.username) {
    window.location.href = "/channels";
  }

  document.getElementById('registration').onsubmit = () => {
      console.log('registration')
      const username = document.getElementById('username').value;
      localStorage.setItem('username', username);
  };

});
