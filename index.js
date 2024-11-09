const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config({})
const App = express()
const userroute = require("./routes/userroute")


App.use(express.json());


App.get("/", (req, res) => {
    res.send("WELCOME TO BACKEND SERVER")
})


App.use("/user", userroute)


mongoose.connect(process.env.MONGO_URI).then(() => {
    App.listen(process.env.PORT, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`Your server listening at http://localhost:${process.env.PORT}`)
        }
    })
}).catch((err) => {
    console.log("error in connecting database", err)
})

