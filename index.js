const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require('./UsersService');

const userService = new UsersService();

app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function(socket) {
    //funkcje, które zostaną wykonane po podłączneiu klienta
    socket.on('join', function(name) {
        //użytkownika, który się pojawił zapisujemy do serwera trzymającego listę osób w czacie
        userService.addUser( {
            id: socket.id,
            name
        });
        //aplikacja emiuje zdarzenie update, kótre aktualizuje informację na temat listy użytkowników nasłuchujących na wydarzenie 'update'
        io.emit('update', {
            users: userService.getAllUsers()
        });
        //funkcja, która ma się wykonać po zamknięciu czatu przez użytkownika
        socket.on('disconnect', () => {
            userService.removeUser(socket.id);
            socket.broadcast.emit('update', {
                users: userService.getAllUsers()
            });
        });
        //wysyłanie wiadomości do czatu
        socket.on('message', function(message) {
            const {name} = userService.getUserById(socket.id);
            socket.emit('message', {
                text: message.text,
                from: name
            });
        });
    });
});

server.listen(3000, function() {
    console.log('listening on *:3000');
});