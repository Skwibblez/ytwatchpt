const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

const connectionString = process.env.MONGODB_URI || 'mongodb+srv://skwibblez:7utakoe@grisaia.jyhgf.mongodb.net/skwibblez?retryWrites=true&w=majority';

MongoClient.connect(connectionString, (err, client) => {
  if (err) return console.error(err)
  console.log('Connected to Database')
  const db = client.db('heroku_wd9m6pvc')
  const songsCollection = db.collection('songs')

  app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    db.collection('songs').find().toArray()
        .then(results => {
          res.render('index.ejs', {songs: results})
        })
        .catch(error => console.error(error))
  });//app.get

  var numUsers = 0;
  io.on('connection', (socket) => {
    //Declare multiple sockets inside of here

    //Count number of connected users
    numUsers = numUsers + 1;
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

    socket.on('db vid link', (video) => {
      //Create obj to store in db
      //CHANGE link to redirect to main YT
      //Pass in length integrity here
      var myobj = {row_num: video[0], user: video[1], song_name: video[2], link: "https://www.youtube.com/embed/" + video[3], integrity: 0}
      songsCollection.insertOne(myobj)
      io.emit('video link', video);
      console.log("DB video[] emitted, row num = " + video[0]);
    });

    socket.on('delete row', (row) => {
      console.log("Delete row: " + row); //Should output to terminal
      songsCollection.deleteOne({row_num: 50}); //Adjust to row later -- need to find out how to synchronize rows
      io.emit('delete row', row);
    });

    socket.on('play row', (row) => {
      console.log("Play row: " + row); //Should output to terminal
      io.emit('play row', row);
    });

    socket.on('hide video',() =>{
      io.emit('hide video');
    });

  }); //io connection


})//mongodb client



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
