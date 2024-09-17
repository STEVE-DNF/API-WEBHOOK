const sessionManager = require('./sessionManager')
const ClientObserver = require('./clientObserver')

const catchAsyncAdapter = require('../../utils/catchAsyncAdapter')

const errorController = require("../controllers/errorController")
const handleController = require("../controllers/handleController")
const orderController = require("../controllers/orderController")
const roomController = require("../controllers/roomController")
const { Server } = require("socket.io");



class SocketInputAdapter {
  static instance = undefined
  constructor(server) {

    if (!SocketInputAdapter.instance) {
      SocketInputAdapter.instance = this;
    }

    this.io = new Server(server);
    this.sessionManager=sessionManager(this.io)
    this.catchAsyncAdapter = catchAsyncAdapter.bind(this)

    this.handleSocketEvents()
  }

  handleSocketEvents() {


    this.io.on('connection', async (socket) => {

      await this.catchAsyncAdapter(handleController.clientAuth,true,{socket})
      //this.handleJoinRoom(socket)
      this.handleOrders(socket)
      this.handleRooms(socket)
      this.handleMessages(socket)
      this.handleSessions(socket)

      
    });
  }
  handleOrders(socket){
    socket.on('orderList', async() => 
      await this.catchAsyncAdapter(orderController.getAllOrder,true,{socket})
    );
  }
  handleSessions(socket){
    socket.on('sessionList', async(room) => 
      await this.catchAsyncAdapter(roomController.getAllSessionRoom,true,{socket,room})
    );
  }
  handleRooms(socket){
    socket.on('roomList', async() => 
      await this.catchAsyncAdapter(roomController.getAllRoom,true,{socket})
    );
  }
  handleMessages(socket){
    socket.on('conversationMessages', () => {
      
    });
  }
  handleDisconnect(socket){
    socket.on('disconnect', () => {
      console.log("client disconnect")
    });
  }
  static getInstance(server){
    if(!SocketInputAdapter.instance && server){
      SocketInputAdapter.instance=new SocketInputAdapter(server)
    }
    return SocketInputAdapter.instance
  }
}

module.exports = SocketInputAdapter.getInstance;
