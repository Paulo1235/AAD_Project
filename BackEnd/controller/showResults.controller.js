const { StatusCodes } = require("http-status-codes");
const sql = require("mssql");
const moment = require("moment");

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

const ShowResults = async (req, res, next) => {
  try {
    const pool = await sql.connect(config);
    const numeroAbastecimentosResultado = await pool.request().query(`
        Select Cliente.Nome, Veiculo.Matricula, Count(AbastecimentoID)
        from Abastecimento
            Join Veiculo on Veiculo.VeiculoID=Abastecimento.VeiculoVeiculoID
            Join Cliente on Cliente.CID=Veiculo.ClienteCID
        Group by Cliente.Nome, Veiculo.Matricula
    `);

    if (numeroAbastecimentosResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "erro." 
        });
    }

    if (numeroAbastecimentosResultado.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "mostrado.",
      });
    }
  } catch (error) {
    console.error("Erro ao mostrar:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { ShowResults };
