// video - https://www.youtube.com/watch?v=uDS6c6DZyY4
// meter gitignore

const express = require("express");
require('dotenv').config();
const app = express();
const sql = require("mssql");
const colors = require("colors");
const StatusCodes = require("http-status-codes");
const checkDatabaseConnection = require ("./database");
const cors = require("cors");

const showR = require("./route/show.route");
const vehicleRouter = require("./route/vehicle.route");
const refuelRouter = require("./route/refuel.route");
const otherServiceRouter = require("./route/otherService.route");
const clientRouter = require("./route/client.route");

const server = app.listen(process.env.PORTSERVER, async () => {
  console.log(
    `\nServidor a correr,`.green +
      ` Ativo em: ` +
      `http://localhost:${process.env.PORTSERVER}`.underline.yellow
  );

  await checkDatabaseConnection();

});

app.use(cors());

// Para processar json
app.use(express.json());

app.use("/api/v1", vehicleRouter);
app.use("/api/v1", refuelRouter);
app.use("/api/v1", otherServiceRouter);
app.use("/api/v1", clientRouter);
app.use("/api/v1", showR);
app.get(
  "/teste",
  (req, res, next) => {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Olá",
    });
  }
);

// Se encontrar alguma rota que não existe
app.all(
  "*",
  (req, res, next) => {
    const err = new Error(`Rota ${req.originalUrl} não encotnrada`);
    err.statusCode = StatusCodes.NOT_FOUND;
    next(err);
  }
);


// O server não continua a executar após um erro que não foi trarado
process.on('unhandledRejection', (err) => {
  console.log(`Erro: `.white + `${err.message}`.red.bold);
  console.log('\nA encerrar o servidor'.red.bold);

  server.close(() => {
    process.exit(1);
  });
});

