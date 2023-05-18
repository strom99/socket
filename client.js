document.getElementById("conectar").addEventListener("click", btnsock);
document.getElementById("btnsend").addEventListener("click", clickbtnsend);
document.getElementById("desconectar").addEventListener("click", desconectar);
const divchat = document.getElementById("divchat");
const mgpublic = document.getElementById("mgpublic");
const mgprivat = document.getElementById("mgprivat");
const mgs = document.getElementById("mgs");
let conectados = [];

function btnsock() {
  crearWebSocket();
}
let nick;
let socket;
function crearWebSocket() {
  nick = prompt("Escribe un nombre para conectarte");

  if (!nick) {
    alert("Necesitas un nombre");
    return;
  }
  conectados.push(nick);

  socket = new WebSocket("ws://localhost:8089");
  socket.onopen = function (evt) {
    socket.send(JSON.stringify({ type: "new-connection", nick }));
  };

  socket.onmessage = (message) => {
    console.log("Message received from server", message);
    const messageJSON = JSON.parse(message.data);
    switch (messageJSON.type) {
      case "new-connection":
        divchat.innerHTML += `<div>${messageJSON.nick} Se ha conectado</div>`;
        break;
      case "new-message":
        // diferenciamos los tipos de mensaje
        switch (messageJSON.channel) {
          case "private":
            mgprivat.innerHTML += `<div>Mensaje privado de ${messageJSON.nick}: ${messageJSON.text}</div>`;
            break;
          case "public":
            mgpublic.innerHTML += `<div>Mensaje publico de ${messageJSON.nick}: ${messageJSON.text}</div>`;
            break;
          case "error":
            mgs.innerHTML += `<div>Error ${messageJSON.message}</div>`;
            break;
        }
        break;
    }
  };
}
function clickbtnsend() {
  const text = document.getElementById("inchat").value;
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({ type: "new-message", channel: "public", nick, text })
    );
  } else {
    console.log("El WebSocket aún no está listo para enviar mensajes.");
  }
}

document.getElementById("btnsend-private").addEventListener("click", () => {
  const to = document.getElementById("private-to").value;
  const message = document.getElementById("private-message").value;
  socket.send(
    JSON.stringify({
      type: "new-message",
      channel: "private",
      nick,
      receiver: to,
      text: message,
    })
  );
});

function desconectar() {
  socket.send(
    JSON.stringify({
      type: "closed-connection",
      channel: "public",
      nick,
    })
  );
  socket.close();
  divchat.innerHTML += "<div>Te has desconectado</div>";
}
