function echo(){
  console.log("hey this worked")
}
function deleteRow(obj) {
    //Test how sockets work
    var socket = io();
    var index = obj.parentNode.parentNode.rowIndex;
    socket.emit('delete row', index);
}
