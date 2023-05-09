document.getElementById("conectar").addEventListener("click", btnsock);
document.getElementById("btnsend").addEventListener("click", clickbtnsend);
document.getElementById("desconectar").addEventListener("click", desconectar);
const divchat = document.getElementById("divchat");
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
    divchat.innerHTML = "<div>Web socket conectado</div>";
    socket.send(JSON.stringify({ nick }));
  };

  // socket.onmessage = (message) => {
  //   let dato = message.data;
  //   console.log(JSON.parse(dato));
  //   divchat.innerHTML += `<div>Message rebut ${message.data}</div>`;
  //   console.log("Message received from server", message);
  // };

  socket.onuser = (user) => {
    console.log("user");
    console.log(user);
  };
}
function clickbtnsend() {
  const text = document.getElementById("inchat").value;
  socket.send(text);
  divchat.innerHTML = `<div>${nick}: enviado...${text}</div>`;
}

function desconectar() {
  socket.close();
  divchat.innerHTML += "<div>desconnectant..</div>";
}
