const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/AgriNext")
const db=mongoose.connection
db.once('open',()=>{
    console.log("Data base connected successfully");
    
})
db.on('error',()=>{
    console.log("Error in connecting to database",err);
    
})