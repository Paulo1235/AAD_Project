const express = require("express");

const { AddVehicle, RemoveVehicle, UpdateVehicle, GetVehicle } = require("../controller/vehicle.controller");

const vehicleRouter = express.Router();

vehicleRouter.post("/add-vehicle", AddVehicle);

vehicleRouter.delete("/remove-vehicle", RemoveVehicle);

vehicleRouter.put("/update-vehicle", UpdateVehicle);

vehicleRouter.get("/get-vehicle/:matriculaVeiculo", GetVehicle);

module.exports = vehicleRouter;
