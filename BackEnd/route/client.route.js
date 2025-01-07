const express = require("express");

const { AddClient, RemoveClient, UpdateClient } = require("../controller/client.controller");

const clientRouter = express.Router();

clientRouter.post("/add-client", AddClient);

clientRouter.delete("/remove-client", RemoveClient);

clientRouter.put("/update-client", UpdateClient);

module.exports = clientRouter;