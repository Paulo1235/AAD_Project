const express = require("express");

const { AddClient, RemoveClient, UpdateClient, GetClient } = require("../controller/client.controller");

const clientRouter = express.Router();

clientRouter.post("/add-client", AddClient);

clientRouter.delete("/remove-client", RemoveClient);

clientRouter.put("/update-client", UpdateClient);

clientRouter.get("/get-client/:contribuinteCliente", GetClient);

module.exports = clientRouter;