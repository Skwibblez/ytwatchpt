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
// res.render('index.ejs', {songs: results})
var server_auto_row;
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
          console.log("Upon enter auto row: " + server_auto_row)
  });//app.get

  var numUsers = 0;
  var runningIndex = 1;
  io.on('connection', (socket) => {
    //Declare multiple sockets inside of here
    numUsers = numUsers + 1;  //Count number of connected users
    io.emit('count users', numUsers);
    io.emit('update running_index', runningIndex);

    setTimeout(function(){
      io.emit('find playing vid')
    }, 1000);


    socket.on('update to playing vid',(newVideo)=>{
      console.log("Updating to palying vid emitted -- server")
      console.log("new vid[0]" + newVideo[0])
      console.log("new vid[1]" + newVideo[1])
      //Send back to clients and check if newUser is true
      io.emit('update client playing vid',newVideo)
    });

    socket.on('progress bar seek',(seekTime)=>{
      io.emit('client bar seek', seekTime);
    });

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
      //Create obj to store in db || CHANGE link to redirect to main YT
      //Pass in length integrity here
      var myobj = {row_num: video[0],
        song_name: video[1],
        link: "https://www.youtube.com/embed/" + video[2],
        integrity: 0
      };
      songsCollection.insertOne(myobj)
      io.emit('video link', video);
      console.log("DB video[] emitted, row num = " + video[0]);
      console.log("Title inputted: " + video[1]);
      console.log("Video inputted: " + "https://www.youtube.com/embed/" + video[2]);
    });

    socket.on('delete row', (row) => {
      var deletion_number = Number(row[1]);
      songsCollection.deleteOne({row_num: deletion_number});
      io.emit('delete row', row[0]);
      console.log("Delete row: " + row[1]); //Should output to terminal
      console.log("Deletion num: " + deletion_number);
    });

    socket.on('play row', (row) => {
      console.log("Play row: " + row); //Should output to terminal
      runningIndex = row;
      server_auto_row = row;
      io.emit('play row', row);
      console.log("New server auto row: " + server_auto_row)
    });

    socket.on('hide video',() =>{
      io.emit('hide video');
    });

    socket.on('testing',(title)=>{
      console.log("Test recieved:" + title)
      io.emit('output title', title);
    });

    socket.on('server play',() =>{
      console.log("Server play detected");
      io.emit('client play');
    });

    socket.on('server pause',() =>{
      console.log("Server pause detected");
      io.emit('client pause');
    });

    socket.on('server autoplay', () =>{
      console.log("Server autoplay detected")
      io.emit('client autoplay');
    });
    //var signalOn = 0;
    socket.on('stop multi',()=>{
      console.log("Stop multi detected")
      // io.emit('client autoplay');
    });
  }); //io connection
})//mongodb client

var PORT = process.env.PORT || 2222;
http.listen(PORT, () => {
  console.log('listening on *:2222');
});


// });
