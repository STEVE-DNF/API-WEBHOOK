const databaseConnect = require('../../config/databaseConnect')

exports.connection =()=>databaseConnect.getConnection(process.env.MONGO_NAMEDATABASE_01)
