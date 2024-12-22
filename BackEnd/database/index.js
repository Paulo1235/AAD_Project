require("dotenv").config();
const sql = require("mssql");
const colors = require("colors");
const { bold, red, green, yellow, blue, underline } = require("colors");

// const { config } = require("./config");

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE,
  port: parseInt(process.env.PORTDB, 10),
  options: {
    encrypt: false,
    trustServerCertificate: false,
    enableArithAbort: true,
    instancename: process.env.INSTANCENAME,
  },
};

const checkDatabaseConnection = async () => {
  try {
    await sql.connect(config).then((data) => {
      //TODO Tenho de ver como se obtém o nome do servidor e da base de dados
      const server = config.server;
      const database = config.database;

      console.log(
        underline(bold(green(`Base de dados conectada com sucesso`))) +
          ` | ` +
          bold(yellow(`Servidor: `)) +
          underline(bold(yellow(`${server}`))) +
          ` | ` +
          bold(blue(`Base de dados: `)) +
          underline(bold(blue(`${database}`)))
      );
    });
  } catch (error) {
    console.log(
      bold(red("Ocorreu um erro ao conectar à base de dados: ")) +
        underline(bold(red(`${error.message}`)))
    );
    // 5 segundos, mestres
    setTimeout(checkDatabaseConnection, 5000);
  }
};

module.exports = checkDatabaseConnection;
