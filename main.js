(() => {
  var ui = {
    timeline: document.querySelector('ul#timeline'),
    submit:   document.querySelector('input[type=submit]'),
    message:  document.querySelector('input[type=text]'),
    reset:    () => (ui.message.value = "") || ui.message.focus(),
  };
  var url = new URL(location.href);
  var socket = new WebSocket(`ws://${url.host}/socket`);
  socket.onopen = e => socket.send(JSON.stringify({text:"Joined!", type:"GREET"}));
  socket.onmessage = e => {
    const payload = JSON.parse(e.data);
    if (payload.text == "yourself") return (ui.submit.style.backgroundColor = payload.user) && (ui.submit.style.borderColor = payload.user);
    ui.timeline.innerHTML = `<li style="color:${payload.user}">[${payload.user}] ${payload.text}</li>` + ui.timeline.innerHTML;
    // FIXME: Escape XSS
  };

  const send = () => (ui.message.value.length == 0) ? null : (socket.send(JSON.stringify({text:ui.message.value})) || ui.reset());
  ui.submit.addEventListener('click', send);
  const ENTER_KEY = 13;
  ui.message.addEventListener('keydown', ev => (ev.which == ENTER_KEY) ? send() : null);
})();
