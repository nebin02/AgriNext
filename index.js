require("dotenv").config()
const express = require("express")
const routes = require('./routes')
const cors = require('cors')
const db = require('./db')
const app = express()
app.use(express.json())
app.use(cors())
app.use("/", routes)
app.listen(3000, () => {
    console.log("the server is running in the 3000 port");

})