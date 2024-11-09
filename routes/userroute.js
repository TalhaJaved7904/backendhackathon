const express = require("express")
const UserController = require("../controller/usercontroller")
const isAuthenticated = require("../middlewares/isAuthenticated")

const Route = express.Router()

Route.post("/login", UserController.login)
Route.post("/register", UserController.register)
Route.get("/logout", UserController.logout)
Route.get("/get", UserController.getAll)
Route.get("/get/:id", UserController.getById)
Route.delete("/:id", UserController.del)
Route.post("/profile/update", isAuthenticated.protected, UserController.updateProfile)



module.exports = Route;