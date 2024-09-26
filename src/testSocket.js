
const io = require("socket.io-client");
const qrcode = require('qrcode-terminal');

const serverUrl = "http://localhost:3000"; 

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZWVmYzRlMDYzZWY3YzRiNDY3ZTNlOCIsImlhdCI6MTcyNjkyNjUwNiwiZXhwIjoxNzM0NzAyNTA2fQ.VRv9MY5dLeJO0GEj8zHaqM_TtdpdyKLVQQOZltsSLnA"

const socket = io(serverUrl,{ query: { token } });

setInterval(()=>{
    socket.emit('sessionList','65eefc67063ef7c4b467e411');
},5000)

/*
orderList
sessionList
roomList
conversationMessages
receiveQR
clientAdded
clientReady
clientAuthenticated
clientError
*/

socket.on("orderList", (response) => {
    console.log(response)
});
socket.on("sessionList", (response) => {
    console.log(response)
});
socket.on("roomList", (response) => {
    console.log(response)
});
socket.on("clientAdded", (response) => {
    console.log(response)
});
socket.on("clientReady", (response) => {
    console.log(response)
});
socket.on("receiveQR", (response) => {
    qrcode.generate(response.data, { small: true });
});
socket.on("clientAuthenticated", (response) => {
    console.log(response)
});
socket.on("clientError", (error) => {
    console.log(error)
});


