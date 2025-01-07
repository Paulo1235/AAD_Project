const express = require("express");

const { ShowResults } = require("../controller/showResults.controller");

const showR = express.Router();

showR.get("/show-results", ShowResults);

module.exports = showR;