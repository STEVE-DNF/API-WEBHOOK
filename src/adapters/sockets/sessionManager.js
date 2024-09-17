const translatorNextIO = require('../../utils/translatorNextIO')

//Error al terminar el evento qr , dado que al crear el la instancia cliente se agregar al observador antes de incializar los eventos

const messageEmit = (io,room,event,{status,messageCode,data})=>{
  if(!status) status = "fail"
  if(!messageCode) messageCode = "If an error occurred."

  const responde = { 
    status,
    message:translatorNextIO(messageCode),
    timestamp: new Date().toISOString()
  }

  if(data) responde.data = data

  io.to(String(room)).emit(event,responde)

}



class SessionManager{
    static instance = undefined

    constructor(io){
        if (!SessionManager.instance) {
            SessionManager.instance = this;
        }
        console.log("Load Session Manager")
        this.io = io
        this.observers = [];
    }
    async addObserver(observer) {
  

      const sessionExist  = await this.existSession(observer.room_id,observer.session._id)
      
      if(!sessionExist){

        const qrActiveInRoom  = await this.isAnyQrActive(observer.room_id)

        if(!qrActiveInRoom){
          this.observers.push(observer);
          messageEmit(this.io,observer.room_id,'clientAdded',{status:"success",messageCode:"ADDED_CLIENT"})
          return true
        }
        messageEmit(this.io,observer.room_id,'clientAdded',{messageCode:"ERROR_PENDING_CLIENT_QR"})
        return false
      }
      messageEmit(this.io,observer.room_id,'clientAdded',{messageCode:"ERROR_PENDING_CLIENT"})
      return false
    }

    async removeObserver(room_id,session_id) {

      let observedFound = undefined
      const index = this.observers.findIndex(observer=>{
        if(!(observer[`room_id`] === room_id && String(observer[`session`]['_id'])===String(session_id))) return false

        observedFound = observer
        return true
      })

      if (index !== -1) {
        this.observers.splice(index, 1);
        return observedFound
      }
      return observedFound
    }
    async isAnyQrActive(room_id){

      const observersEmit = this.observers.filter(observer=> observer[`room_id`].toString() === room_id.toString())
      return observersEmit.some(observed=>observed.qrActive === true)
  
    }
    async existSession(room_id,session_id){
      return this.observers.some(observer=>observer[`room_id`] === room_id && String(observer[`session`]['_id'])===String(session_id))
    }
    updateAllClients(sessions){
      return sessions.map((session, _, __) => {

        const sessionJson=session.toObject()

        sessionJson.number = `+${sessionJson.number.code} ${sessionJson.number.phone}`

        const updateReady=this.observers.find(observer=>{
          return observer[`session`][`_id`].toString() === sessionJson._id.toString()
        })

        sessionJson.ready = false

        if(!updateReady)return sessionJson
        
        sessionJson.ready = updateReady.ready
        return sessionJson;
        
      })
    }
    async notifyQr(room_id,qr){
      messageEmit(this.io,room_id,'receiveQR',{status:"success",messageCode:"QR_EMITTED",data:qr})
    }
    async notifyAuthenticated(room_id){
      messageEmit(this.io,room_id,'clientAuthenticated',{status:"success",messageCode:"CLIENT_AUTHENTICATED"})
    }
    async notifyFailAuthenticated(room_id){
      messageEmit(this.io,room_id,'clientAuthenticated',{status:"success",messageCode:"CLIENT_FAIL_AUTHENTICATED"})
    }
    async notifyReady(room_id){
      messageEmit(this.io,room_id,'clientReady',{status:"success",messageCode:"CLIENT_READY"})
      return true
    }
    static getInstace(io){
      if (!SessionManager.instance && io) {
        SessionManager.instance = new SessionManager(io)
      }
      return SessionManager.instance; 
    }
  }
  
  
  module.exports = SessionManager.getInstace