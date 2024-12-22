const express = require("express");

const { AddVehicle } = require("../controller/vehicle.controller");

const vehicleRouter = express.Router();

vehicleRouter.post("/add-vehicle", AddVehicle);

module.exports = vehicleRouter;