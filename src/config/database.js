const mongoose = require('mongoose')
const mysql = require('mysql2/promise')

const dotenv = require('dotenv')
dotenv.config()


class DatabaseConnection {
    static instance = null
    constructor() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = this
        }
        if (!DatabaseConnection.connections) {
            DatabaseConnection.connections = {}
        }
    }
    async connect(databaseType){
        try{
            if(!DatabaseConnection.connections[databaseType]){
                if(databaseType =="mongodb"){
                    DatabaseConnection.connections[databaseType]=await this.connectToDatabaseMongo()
                }
                else if(databaseType =="sqldb"){
                    DatabaseConnection.connections[databaseType]=await this.connectToDatabaseSql()
                }
                else{
                    console.log(`:::::::::::::Database NotExist:::::::::::::`)
                }
            }
            else{
                console.log(`:::::::::::::Database Exist ${databaseType}:::::::::::::`)
            }
        }
        catch(er){
            console.log(`:::::::::::::Error Database:::::::::::::`)
        }
    }
    async connectToDatabaseMongo() {
        try {

            console.log(`:::::::::::::MongoDB Connected:::::::::::::`)
            this.uri = "mongodb+srv://"+process.env.DATA_USER_MONGODB+":"+process.env.DATA_PASSWORD_MONGODB+"@"+process.env.DATA_NAME_MONGODB+".tujo7ef.mongodb.net/"+process.env.DATA_NAME_MONGODB+"?retryWrites=true&w=majority"
            return await mongoose.connect(this.uri)
        }
        catch (error) {
            process.exit(1)
        }
    }
    async connectToDatabaseSql() {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DATA_HOST_MYSQLDB,
                user: process.env.DATA_USER_MYSQLDB,
                password: process.env.DATA_PASSWORD_MYSQLDB,
                database: process.env.DATA_NAME_MYSQLDB,
                port: process.env.DATA_PORT_MYSQLDB
            })
            console.log(`:::::::::::::MySQL Connected:::::::::::::`)
            return connection
        }
        catch (error) {
            console.error(`Error connecting to MySQL: ${error}`)
            process.exit(1)
        }
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance
    }

}
module.exports = DatabaseConnection.getInstance()