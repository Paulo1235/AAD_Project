const express = require("express");

const { AddVehicle, RemoveVehicle, UpdateVehicle } = require("../controller/vehicle.controller");

const vehicleRouter = express.Router();

vehicleRouter.post("/add-vehicle", AddVehicle);

vehicleRouter.delete("/remove-vehicle", RemoveVehicle);

vehicleRouter.put("/update-vehicle", UpdateVehicle);

module.exports = vehicleRouter;
