const express = require('express');
const http = require('http');
 
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
var path = require ('path');

var engines = require('consolidate');

app.engine('html', engines.mustache);
app.set('view engine', 'html');




let waiting = null;
 
io.on('connection', (sock) => {
  sock.emit('msg', 'Povezani ste');
  sock.on('msg', (msg) => io.emit('msg', msg));
 
  if (waiting === null) {
    sock.emit('msg', 'Molimo pričekajte drugog igrača');
    waiting = sock;
  } else {
    startGame(waiting, sock);
    waiting = null;
  }
 
});
 
let roomId = 1;
 let round=1;
function startGame(p1, p2) {
  const roomName = 'RPS' + roomId++;
  let p1Turn = null;
  let p2Turn = null;
 
  [p1, p2].forEach((p) => p.join(roomName));
  io.to(roomName).emit('msg', 'Igra počinje!');
  io.to(roomName).emit('msg', '-----------------------');
  io.to(roomName).emit('msg', round+'. runda!');

  p1.on('turn', (e) => {
    console.log('Prvi igrač je izabrao:'+e);
    p1Turn = e;
    checkRoundEnd();
  });
 
  p2.on('turn', (e) => {
    console.log('Drugi igrač je izabrao:'+e);
    p2Turn = e;
    checkRoundEnd();
  });

let br1=0;
let br2=0;

  function checkRoundEnd() {
    if (p1Turn !== null && p2Turn !== null) {
        if(p1Turn==p2Turn){
          io.to(roomName).emit('msg', 'Nerešeno je!');
        }
        if(p1Turn=='kamen'){
          if(p2Turn=='makaze'){
            br1++;
            io.to(roomName).emit('msg', 'Prvi igrač je pobedio!');
          }
          else if(p2Turn=='papir'){
            br2++;
            io.to(roomName).emit('msg', 'Drugi igrač je pobedio!');
          }
        }

        if(p1Turn=='papir'){
          if(p2Turn=='makaze'){
            br2++;
            io.to(roomName).emit('msg', 'Drugi igrač je pobedio!');
          }
          else if(p2Turn=='kamen'){
            br1++;
            io.to(roomName).emit('msg', 'Prvi igrač je pobedio!');
          }
        }

        if(p1Turn=='makaze'){
          if(p2Turn=='kamen'){
            br2++;
            io.to(roomName).emit('msg', 'Drugi igrač je pobedio!');
          }
          else if(p2Turn=='papir'){
            br1++;
            io.to(roomName).emit('msg', 'Prvi igrač je pobedio!');
          }
        }
      io.to(roomName).emit('msg', 'Prvi igrač: '+br1);
      io.to(roomName).emit('msg', 'Drugi igrač: '+br2);

      
      round++;
      io.to(roomName).emit('msg', '-----------------------');
      io.to(roomName).emit('msg', round+'. runda!');
 
      p1Turn = p2Turn = null;
    }
  }
}
 
app.use(express.static(path.join(__dirname + '/public')));
 
app.get('/', function(req, res){
  res.render('index');
});


server.listen(3000, () => console.log('Radi na localhost:3000'));

