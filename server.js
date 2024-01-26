const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const connectedClients = {}; // Almacenar información sobre clientes conectados

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');
  
    // Crear un marcador para el cliente conectado
    const clientMarker = {
      lat: -15.8402 + Math.random() * 0.01,
      lng: -70.0219 + Math.random() * 0.01,
    };
  
    // Almacenar el marcador en la lista de clientes conectados
    connectedClients[socket.id] = clientMarker;
  
    // Enviar la posición inicial del marcador al cliente recién conectado
    socket.emit('updateMotoPosition', { clientId: socket.id, position: clientMarker });
  
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
  
      // Emitir un mensaje de desconexión con el clientId
      io.emit('clientDisconnected', { clientId: socket.id });  

      // Eliminar el marcador asociado al cliente desconectado
      delete connectedClients[socket.id];
    });
  
    // Escuchar actualizaciones de posición de la moto desde el cliente
    socket.on('motoPosition', (position) => {
      console.log('Cambio en la posición de la moto', position);
  
      // Actualizar la posición del cliente en la lista
      connectedClients[socket.id] = position;
  
      // Emitir la nueva posición a todos los clientes con el id del cliente
      io.emit('updateMotoPosition', { clientId: socket.id, position });
    });
  });
  
server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
