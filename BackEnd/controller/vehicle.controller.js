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

const AddVehicle = async (req, res, next) => {
  try {
    console.log("Body:", req.body);
    
    const { contribuinte, matricula, descricao } = req.body;

      
    const pool = await sql.connect(config);

    // Encontrar o cliente com base no contribuinte
    const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE Contribuinte = '${contribuinte}'
    `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Cliente não encontrado." 
        });
    }

    // Extrai o CID (id do cliente)
    const clienteId = clienteResultado.recordset[0].CID;

    // Encontrar o cliente com base na descrição
    const tipoCombustivelResultado = await pool.request().query(`
        SELECT TCID FROM TipoCombustivel WHERE Descricao = '${descricao}'
    `);

    // Verifica se o tipo de combustível existe
    if (tipoCombustivelResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            success: false, 
            message: "Tipo de combustível não encontrado." 
        });
    }

    // Extrai o TCID (id do tipo de combustível)
    const tipoCombustivelId = tipoCombustivelResultado.recordset[0].TCID;

    // Insere o veículo
    const result = await pool
      .request()
      .input("ClienteCID", sql.Int, clienteId)
      .input("Matricula", sql.VarChar, matricula)
      .input("TipoCombustivelTCID", sql.Int, tipoCombustivelId).query(`
    INSERT INTO Veiculo (ClienteCID, Matricula, TipoCombustivelTCID)
    VALUES (@ClienteCID, @Matricula, @TipoCombustivelTCID)
  `);

    if (result.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        sucess: true,
        message: "Veículo adicionado.",
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

module.exports = { AddVehicle };
