const { StatusCodes } = require("http-status-codes");
const sql = require("mssql");

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

const AddOtherService = async (req, res, next) => {
  try {
    console.log("Body:", req.body);
    
    const { descricao, valor, matricula, nomeFuncionario, tipoServico } = req.body;

    const pool = await sql.connect(config);

    const funcionarioResultado = await pool.request().query(`
        SELECT FuncionarioID FROM Funcionario WHERE Nome = '${nomeFuncionario}'
    `);

    if (funcionarioResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Funcionário não encontrado." 
        });
    }

    const funcionarioId = funcionarioResultado.recordset[0].FuncionarioID;

    const tipoServicoResultado = await pool.request().query(`
        SELECT TSID FROM TipoServico WHERE DescTS = '${tipoServico}'
    `);

    if (tipoServicoResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Tipo de serviço não encontrado." 
        });
    }

    const tipoServicoId = tipoServicoResultado.recordset[0].TSID;

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

    // Insere o veículo
    const result = await pool
      .request()
      .input("DescServico", sql.VarChar, descricao)
      .input("Valor", sql.Real, valor)
      .input("VeiculoVeiculoID", sql.Int, veiculoId)
      .input("FuncionarioFuncionarioID", sql.Int, funcionarioId)
      .input("TipoServicoTSID", sql.Int, tipoServicoId).query(`
    INSERT INTO OutroServico (DescServico, Valor, VeiculoVeiculoID, FuncionarioFuncionarioID, TipoServicoTSID)
    VALUES (@DescServico, @Valor, @VeiculoVeiculoID, @FuncionarioFuncionarioID, @TipoServicoTSID)
  `);

    if (result.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Serviço adicionado.",
      });
    }
  } catch (error) {
    console.error("Erro ao adicionar serviço:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { AddOtherService };
