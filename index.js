const express = require('express')
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

//Below is working (original , new is above )
//app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var numUsers = 0;

io.on('connection', (socket) => {

  //Declare multiple sockets inside of here

  //Count number of active users
  numUsers = numUsers+1;
  io.emit('count users', numUsers);
  socket.on('disconnect', () =>{
    console.log('user disconnected');
    numUsers = numUsers -1;
    io.emit('count users', numUsers);
  });

  socket.on('video link', (video) => {
    console.log("Video Link: " + video); //Should output to terminal
    io.emit('video link', video);
  });


  socket.on('delete row', (row) => {
    console.log("Delete row: " + row); //Should output to terminal
    io.emit('delete row', row);
  });
  socket.on('play row', (row) => {
    console.log("Play row: " + row); //Should output to terminal
    io.emit('play row', row);
  });
  socket.on('hide video',() =>{
    io.emit('hide video');
  });

});

// socket.on('chat message', (msg) => {
//   console.log("Message: " + msg); //Should output to terminal
//   io.emit('chat message', msg);
// });
//'

// io.on('connection', (socket) => {
//   socket.on('chat message', (msg) => {
//     console.log('message: ' + msg);
//   });
// });

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });


var PORT = process.env.PORT || 2222;
http.listen(PORT, () => {
  console.log('listening on *:2222');
});
