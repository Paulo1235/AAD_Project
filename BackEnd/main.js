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

const vehicleRouter = require("./route/vehicle.route");

const config = {
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: false,
    enableArithAbourt:true,
    instancename:process.env.INSTANCENAME,
  },
  port: parseInt(process.env.PORTDB, 10)
};

const query = "SELECT * FROM [dbo].[Cliente]";

// Função para estabelecer a ligacao à base de dados

// Funcção para a consulta
/* app.get("/", (req, res) => {
    checkDatabaseConnection()
    .then((message) => {
      // Send the connection success message
      // res.send(message);

    //   // Run the query after confirming the connection
      sql.connect(config)
        .then((pool) => {
          return pool.request().query(query);
        })
        .then((result) => {
          if (result.recordset.length > 0) {
            res.json(result.recordset); // Send the rows returned
          } else {
            res.send("Nothing found in the database.");
          }
        })
        .catch((err) => {
          res.status(500).json({ error: "Query execution failed", details: err });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
}); */

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

