
const io = require("socket.io-client");
const qrcode = require('qrcode-terminal');

const serverUrl = "http://localhost:3000"; 

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZWVmYzRlMDYzZWY3YzRiNDY3ZTNlOCIsImlhdCI6MTcyNzU2MjQwNSwiZXhwIjoxNzM1MzM4NDA1fQ.7rlJQC4Gr3pXB6wA2-WzosudAlddogDLCFCi65Y4yzw"

const socket = io(serverUrl,{ query: { token } });

/*
setInterval(()=>{
    socket.emit('sessionList','65eefc67063ef7c4b467e411');
},5000)


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
setInterval(()=>{
    socket.emit('orderDashboardData');
},5000)


socket.on("orderDashboardData", (response) => {
    console.log(response.data.trends)
});
socket.on("clientError", (error) => {
    console.log(error)
});

/*

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
*/


