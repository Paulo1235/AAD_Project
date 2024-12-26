const express = require("express");

const { AddRefuel } = require("../controller/refuel.controller");

const refuelRouter = express.Router();

refuelRouter.post("/add-refuel", AddRefuel);

module.exports = refuelRouter;