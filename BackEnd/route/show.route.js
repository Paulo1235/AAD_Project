const express = require("express");

const { ShowResults, CreateStoredProcedure } = require("../controller/showResults.controller");

const showR = express.Router();

showR.get("/show-results", ShowResults);

showR.get("/create-and-show-procedure", CreateStoredProcedure);

module.exports = showR;