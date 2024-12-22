require('dotenv').config();

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE,
  port: parseInt(process.env.PORTDB, 10), // ERRO AQUI
  options: {
    encrypt: false,
    trustServerCertificate: false,
    enableArithAbort: true,
    instancename: process.env.INSTANCENAME,
  },
};

console.log("Config:", config);

module.exports = config;