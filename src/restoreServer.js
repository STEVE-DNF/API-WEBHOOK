
process.on('uncaughtException', err => {
    console.log('EVENT : uncaughtException');
    console.log(err.name, err.message,err);
    process.exit(1);
  });
  
  require('dotenv').config({path:"./config.env"})
  const databaseConnect = require('./config/databaseConnect')

  
  async function init(){
  
    await databaseConnect.createConnection(process.env.MONGO_USER_01,process.env.MONGO_PASSWORD_01,process.env.MONGO_NAMEDATABASE_01)
    await databaseConnect.createConnection(process.env.MONGO_USER_02,process.env.MONGO_PASSWORD_02,process.env.MONGO_NAMEDATABASE_02)

    const restoreDatabase = require('./config/restoreDatabase')
    await restoreDatabase()


    process.on('unhandledRejection', err => {
      console.log('EVENT : unhandledRejection');
      console.log(err.name, err.message);
      console.log(err);
      server.close(() => {
        process.exit(1);
      });
    });
  
  }
  
  init()
  
  