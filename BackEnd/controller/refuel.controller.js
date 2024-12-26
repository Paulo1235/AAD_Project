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

const AddRefuel = async (req, res, next) => {
  try {
    console.log("Body:", req.body);

    const { nomeFuncionario, matricula, quantidade, bomba } = req.body;

    const pool = await sql.connect(config);
    // Encontrar o funcionário com base no nome
    const funcionarioResultado = await pool.request().query(`
        SELECT FuncionarioID FROM Funcionario WHERE Nome = '${nomeFuncionario}'
    `);

    // Verifica se o funcionário existe
    if (funcionarioResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Funcionário não encontrado." 
        });
    }

    const funcionarioId = funcionarioResultado.recordset[0].FuncionarioID;

    // Encontrar o veículo com base na matrícula
    const veiculoResultado = await pool.request().query(`
        SELECT VeiculoID FROM Veiculo WHERE Matricula = '${matricula}'
    `);

    // Verifica se veículo existe
    if (veiculoResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Veículo não encontrado." 
        });
    }

    const veiculoId = veiculoResultado.recordset[0].VeiculoID;

    const bombaResultado = await pool.request().query(`
        SELECT BombaID FROM Bomba WHERE BombaID = '${bomba}'
    `);

    if (bombaResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Bomba não encontrada." 
        });
    }

    const dataFormatada = moment().format('YYYY-MM-DD HH:mm:ss');

    const result = await pool
      .request()
      .input("QuantidadeLitros", sql.Int, quantidade)
      .input("Data", sql.DateTime, dataFormatada)
      .input("BombaBombaID", sql.Int, bomba)
      .input("VeiculoVeiculoId", sql.Int, veiculoId)
      .input("FuncionarioFuncionarioID", sql.Int, funcionarioId).query(`
    INSERT INTO Abastecimento (QuantidadeLitros, Data, BombaBombaID, VeiculoVeiculoID, FuncionarioFuncionarioID)
    VALUES (@QuantidadeLitros, @Data, @BombaBombaID, @VeiculoVeiculoID, @FuncionarioFuncionarioID)
  `);

    if (result.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Abastecimento adicionado.",
      });
    }
  } catch (error) {
    console.error("Erro ao adicionar veículo:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { AddRefuel };
