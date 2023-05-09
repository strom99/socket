const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("websocket").server;

const connexions = [];
const connexions_valides = {}; // { nick: "Pedro", mensaje: "Hola" }

// crear el servidor http
const server = http.createServer((request, response) => {
  let filepath = path.join(__dirname, request.url);
  fs.access(filepath, fs.constants.F_OK, (error) => {
    if (error) {
      response.writeHead(404); // archivo no encontrado
      response.end();
    } else {
      fs.readFile(filepath, (error, data) => {
        if (error) {
          response.writeHead(500); // error del servidor
          response.end();
        } else {
          response.writeHead(200, { "Content-Type": "text/html" });
          response.write(data);
          response.end();
        }
      });
    }
  });
  console.log("Peticion del recurso" + filepath);
});

const ws_server = new WebSocket({
  httpServer: server,
  autoAcceptConnections: false,
});

ws_server.on("request", (request) => {
  console.log("peticio ws", request.origin);
  const conexion = request.accept(null, request.origin);

  conexion.on("user", (user) => {
    ws_server.broadcast(user.utf8Data);
    console.log("user" + JSON.parse(user.utf8Data).nick);
  });
  conexion.on("message", (message) => {
    console.log("message rebut of" + message.utf8Data);
    ws_server.broadcast(message.utf8Data);
    // conexion.send("SEND > " + message.utf8Data);
    const messageJSON = JSON.parse(message.utf8Data);
    switch (messageJSON.op) {
      case "alison":
        const nick = messageJSON.value;
        connexions_valides[nick] = conexion;
        //el trec de les connexions generals
        const pos = connexions.indexOf(conexion);
        if (pos != -1) {
          connexions.splice(pos, 1);
        }
        //

        break;
    }
  });

  conexion.on("close", () => {
    conexion.close();
    console.log("Tancada la connexió");
    // const pos = connexions.indexOf(conexion);
    // if (pos != -1) {
    //   connexions.splice(pos, 1);
    // }
  });
});

server.listen("8089", () => {
  console.log("Servidor inicial al puerto 8089");
});
