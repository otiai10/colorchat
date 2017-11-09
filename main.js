(() => {

  var ui = {
    timeline: document.querySelector('ul#timeline'),
    submit:   document.querySelector('input[type=submit]'),
    message:  document.querySelector('input[type=text]'),
    reset:    () => (ui.message.value = "") || ui.message.focus(),
    escape:   raw => raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"),
    send:     (message = ui.message.value) => {
      if (message.length == 0) return ui.reset();
      fetch("/message", {method:"POST",body:JSON.stringify({type:"MESSAGE",text:message,user:myself.id}), headers:{"content-type":"application/json"}});
      ui.reset();
    },
    append:   payload => ui.timeline.innerHTML = `<li style="color:${payload.user}">[${payload.user}] ${ui.escape(payload.text)}</li>` + ui.timeline.innerHTML,
  };

  var myself = {
    update: p => (myself.id = p.user) &&(ui.submit.style.backgroundColor = myself.id) && (ui.submit.style.borderColor = myself.id),
  };

  ui.submit.addEventListener('click', ui.send);
  const ENTER_KEY = 13;
  ui.message.addEventListener('keydown', ev => (ev.which == ENTER_KEY) ? ui.send() : null);

  var url = new URL(location.href);
  var socket = new WebSocket(`${url.protocol.replace("http", "ws")}//${url.host}/socket`);
  socket.onmessage = e => { const payload = JSON.parse(e.data); (payload.type == "CONNECT") ? (myself.update(payload) && ui.send("Joined!")) : ui.append(payload) };
  setInterval(() => socket.send(JSON.stringify({type:"KEEPALIVE"})), 40*1000); // https://devcenter.heroku.com/articles/error-codes#h15-idle-connection
  socket.onerror = e => console.log("[ONERROR]", e);
  socket.onclose = e => console.log("[ONCLOSE]", e);
})();
