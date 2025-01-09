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
        message: "Cliente não encontrado.",
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
        message: "Tipo de combustível não encontrado.",
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
        success: true,
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

const RemoveVehicle = async (req, res) => {
  try {
    const { veiculoId } = req.body;

    if (!veiculoId || isNaN(veiculoId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "ID do veiculo inválido.",
      });
    }

    const pool = await sql.connect(config);

    const veiculoResultado = await pool.request().query(`
        SELECT VeiculoID FROM Veiculo WHERE VeiculoID = '${veiculoId}'
    `);

    // Verifica se o veículo existe
    if (veiculoResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Veículo não existe.",
      });
    }

    const resultado = await pool.request().query(`
        DELETE FROM Veiculo WHERE VeiculoID = ${veiculoId}
    `);

    if (resultado.rowsAffected[0] > 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Veículo removido com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao remover veículo:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const UpdateVehicle = async (req, res) => {
  try {
    const { matricula, novaMatricula, descricao, contribuinte } = req.body;

    if (!matricula) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Matrícula atual é obrigatória.",
      });
    }

    if (!novaMatricula && !descricao && !contribuinte) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Pelo menos um campo de atualização (nova matrícula, descrição ou contribuinte) é obrigatório.",
      });
    }

    const pool = await sql.connect(config);

    const veiculoResultado = await pool.request().query(`
      SELECT VeiculoID, Matricula, TipoCombustivelTCID, ClienteCID 
      FROM Veiculo WHERE Matricula = '${matricula}'
    `);

    if (veiculoResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Veículo não encontrado.",
      });
    }

    const veiculo = veiculoResultado.recordset[0];
    
    let novaMatr = veiculo.Matricula;
    let novoTipoCombustivelId = veiculo.TipoCombustivelTCID;
    let novoClienteId = veiculo.ClienteCID;

    // Se nova matrículaç for fornecida substitui a anterior
    if (novaMatricula) {
      novaMatr = novaMatricula;
    }

    if (descricao) {
      const tipoCombustivelResultado = await pool.request().query(`
        SELECT TCID FROM TipoCombustivel WHERE Descricao = '${descricao}'
      `);

      if (tipoCombustivelResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Tipo de combustível não encontrado.",
        });
      }

      novoTipoCombustivelId = tipoCombustivelResultado.recordset[0].TCID;
    }

    if (contribuinte) {
      const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE Contribuinte = '${contribuinte}'
      `);

      if (clienteResultado.recordset.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Cliente não encontrado.",
        });
      }

      novoClienteId = clienteResultado.recordset[0].CID;
    }

    const atualizar = `
      UPDATE Veiculo
      SET 
        Matricula = @Matricula,
        TipoCombustivelTCID = @TipoCombustivelTCID,
        ClienteCID = @ClienteCID
      WHERE Matricula = @OldMatricula
    `;

    const updateResult = await pool.request()
      .input("Matricula", sql.VarChar, novaMatr)
      .input("TipoCombustivelTCID", sql.Int, novoTipoCombustivelId)
      .input("ClienteCID", sql.Int, novoClienteId)
      .input("OldMatricula", sql.VarChar, matricula)
      .query(atualizar);

    if (updateResult.rowsAffected[0] > 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Veículo atualizado com sucesso.",
      });
    }

  } catch (error) {
    console.error("Erro ao atualizar veículo:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const GetVehicle = async (req, res) => {
  try {
    const { matriculaVeiculo } = req.params;

    if (!matriculaVeiculo) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A matrícula do veículo é obrigatória.",
      });
    }

    // Conecta ao banco de dados
    const pool = await sql.connect(config);

    const veiculoResultado = await pool.request()
      .input("Matricula", sql.VarChar, matriculaVeiculo)
      .query(`
        SELECT VeiculoID, Matricula, TipoCombustivelTCID, ClienteCID 
        FROM Veiculo
        WHERE Matricula = @Matricula
      `);

    if (veiculoResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Veículo não encontrado.",
      });
    }

    const veiculo = veiculoResultado.recordset[0];

    const tipoCombustivelResultado = await pool.request()
      .input("TipoCombustivelTCID", sql.Int, veiculo.TipoCombustivelTCID)
      .query(`
        SELECT Descricao
        FROM TipoCombustivel
        WHERE TCID = @TipoCombustivelTCID
      `);

    const clienteResultado = await pool.request()
      .input("ClienteCID", sql.Int, veiculo.ClienteCID)
      .query(`
        SELECT Contribuinte
        FROM Cliente
        WHERE CID = @ClienteCID
      `);

    const tipoCombustivel = tipoCombustivelResultado.recordset[0].Descricao;
    const contribuinte = clienteResultado.recordset[0].Contribuinte;

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        Matricula: veiculo.Matricula,
        TipoCombustivel: tipoCombustivel,
        ClienteContribuinte: contribuinte,
      },
    });
  } catch (error) {
    console.error("Erro ao obter os dados do veículo:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { AddVehicle, RemoveVehicle, UpdateVehicle, GetVehicle };
