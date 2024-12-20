// video - https://www.youtube.com/watch?v=uDS6c6DZyY4
// meter gitignore

const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORTSERVER;
const sql = require("mssql");

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
const checkDatabaseConnection = () => {
  return sql.connect(config)
    .then(() => "Connection to the database was successful!")
    .catch((err) => {
      console.error("Database connection error:", err);
      throw new Error("Failed to connect to the database.");
    });
};

// Funcção para a consulta
app.get("/", (req, res) => {


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
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
