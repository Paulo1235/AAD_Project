const express = require("express");

const { AddOtherService } = require("../controller/otherService.controller");

const otherServiceRouter = express.Router();

otherServiceRouter.post("/add-other-service", AddOtherService);

module.exports = otherServiceRouter;