const express = require("express")
const apiRoute = require("./routes/routes")
const cors = require("cors");
const dbConnection = require("./config/database")
const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
  //origin: "http://localhost:62010"
  origin: "*"
}));

async function connect() {
  await dbConnection.connect("mongodb")
  //await dbConnection.connect("sqldb")
}

connect()

app.use("/webhook", apiRoute)

app.listen(PORT, () => {
  console.log(`:::::::::::::PORT :${PORT}:::::::::::::`)
})
