const { Client, LocalAuth } = require('whatsapp-web.js');
const formattedPhoneNumber = require('../../utils/formattedPhoneNumber')
const sessionService = require('../../services/sessionService')
const whatsappController = require('../controllers/whatsappController')

class ClientObserver{
  constructor(sessionManager,restaurant,room,system){

    this.sessionManager = sessionManager
    this.room_id = room
    this.system_id = system
    this.restaurant_id = restaurant
    this.session =undefined
    this.reconnect =false
    this._ready = false
    this._qrActive=false
    
  }
  get ready(){
    return this._ready
  }
  get qrActive(){
    return this._qrActive
  }
  
  createClient(){

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: this.session._id ,dataPath:'./data'})
    });

    try{
      this.client.on('qr',(qr)=>{
        this._qrActive = true
        this.sessionManager.notifyQr(this.room_id,qr)
      });

      this.client.on('authenticated',()=>this.sessionManager.notifyAuthenticated(this.room_id));
      this.client.on('auth_failure', ()=>this.sessionManager.notifyFailAuthenticated(this.room_id));

      this.client.on('message',async (message)=> {
        this.session=await this.getClient()
        await whatsappController.receivedMessage(this.client,message,{restaurant:this.restaurant_id ,ready:this._ready,session:this.session._id,active:this.session.active,from:message.from})
      })

      this.client.on('ready', async () => {
        
        if(this.reconnect){
          await this.sessionManager.notifyReady(this.room_id)
        }
        else{
          const phone = this.client.info.me.user
          const formatted= formattedPhoneNumber(phone)
          const session = await sessionService.createAndPersistSessionService(this.session,formatted)
          if(session.success) await this.sessionManager.notifyReady(this.room_id)
        }
        this._ready = true
        this._qrActive = false
      });
      this.client.on('disconnected', async () => {
        this._ready = false
        this._qrActive = false
      });
    }
    catch(err){
      console.log("ERROR : ",err)
    }
  }
  async initialize(reconnect) {
    this._qrActive = true
    this.reconnect = reconnect

    if(!this.reconnect) {
      
      const createSession = await sessionService.createSessionNoSavedService(this.system_id,this.room_id)
      this.session = createSession.data
    }
    
    if(!this.session) return undefined

    this.createClient()
    this.client.initialize()

    return this.session
  }
  async sendMessageClient(code , phone ,content){
    const idChat = `${code}${phone}@c.us`
    await this.client.sendMessage(idChat,content)
  }
  static async reconnectsClient(sessionManager,restaurant,system,room,session) {

    if(!sessionManager || !system || !room || !session) return undefined

    const clientObserver = new ClientObserver(sessionManager,restaurant,room,system) 

    clientObserver.session = session

    await clientObserver.initialize(true)

    return clientObserver
  }
  async getClient(){
    const getSession = await sessionService.getSessionService(this.session._id)
    return getSession.data
  }
  async asyncOperation(action,func){
    try{
      await func()
      return true
    }
    catch(err){
      return false
    }
  }
  async logoutSession() {
    return this.asyncOperation('logout', async () => await this.client.logout());
  }
}
module.exports = ClientObserver

