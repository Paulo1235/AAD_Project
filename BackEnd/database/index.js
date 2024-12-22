require("dotenv").config();
const sql = require("mssql");
const colors = require("colors");
const { bold, red, green, yellow, blue, underline } = require("colors");

const checkDatabaseConnection = async () => {
  try {
    const config = {
      user: "Hugo2",
      password: process.env.PASSWORD,
      server: process.env.SERVER_NAME,
      database: process.env.DATABASE,
      options: {
        encrypt: false,
        trustServerCertificate: false,
        enableArithAbourt: true,
        instancename: process.env.INSTANCENAME,
      },
      port: parseInt(process.env.PORTDB, 10),
    };

    await sql.connect(config).then((data) => {
      //TODO Tenho de ver como se obtém o nome do servidor e da base de dados
      const server = process.env.SERVER_NAME;
      const database = process.env.DATABASE;

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
