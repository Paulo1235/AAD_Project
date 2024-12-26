const express = require("express");

const { AddClient, RemoveClient } = require("../controller/client.controller");

const clientRouter = express.Router();

clientRouter.post("/add-client", AddClient);

clientRouter.delete("/remove-client", RemoveClient);

module.exports = clientRouter;