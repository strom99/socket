const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("websocket").server;

const connections = {}; // lista de conexiones por usuario

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
          // para interpretar bien los archivos
          const extName = path.extname(filepath);

          switch (extName) {
            case ".html":
              response.writeHead(200, { "Content-Type": "text/html" });
              break;
            case ".css":
              response.writeHead(200, { "Content-Type": "text/css" });
              break;
            case ".js":
              response.writeHead(200, { "Content-Type": "text/javascript" });
              break;
          }

          response.write(data);
          response.end();
        }
      });
    }
  });
});

const ws_server = new WebSocket({
  httpServer: server,
  autoAcceptConnections: false,
});

ws_server.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("message", (message) => {
    const messageJSON = JSON.parse(message.utf8Data);
    switch (messageJSON.type) {
      case "new-connection":
        connections[messageJSON.nick] = connection;
        // envio a todos los conectados
        ws_server.broadcast(JSON.stringify(messageJSON));
        break;
      case "closed-connection":
        ws_server.broadcast(
          JSON.stringify({
            type: "new-message",
            channel: "public",
            nick: messageJSON.nick,
            text: "Se ha desconectado el usuario " + messageJSON.nick,
          })
        );
        connections[messageJSON.nick].close();
        delete connections[messageJSON.nick];
        break;
      case "new-message":
        // diferencia entre privado y publico
        switch (messageJSON.channel) {
          case "private":
            const receiverConnection = connections[messageJSON.receiver];
            if (receiverConnection) {
              receiverConnection.send(JSON.stringify(messageJSON));
              connection.send(JSON.stringify(messageJSON));
            } else {
              connection.send(
                JSON.stringify({
                  type: "new-message",
                  channel: "error",
                  message: "No hay un usuario con ese nombre conectado",
                })
              );
            }
            break;
          case "public":
            ws_server.broadcast(JSON.stringify(messageJSON));
            break;
        }
        break;
    }
    console.log("New message", messageJSON);
    console.log("Connections", Object.keys(connections));
  });

  connection.on("close", (...args) => {
    console.log("e", connections, args);
    console.log("Tancada la connexió");
  });
});

server.listen("8089", () => {
  console.log("Servidor inicial al puerto 8089");
});
