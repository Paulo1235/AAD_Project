const express = require("express");

const { AddVehicle, RemoveVehicle } = require("../controller/vehicle.controller");

const vehicleRouter = express.Router();

vehicleRouter.post("/add-vehicle", AddVehicle);

vehicleRouter.delete("/remove-vehicle", RemoveVehicle);

module.exports = vehicleRouter;