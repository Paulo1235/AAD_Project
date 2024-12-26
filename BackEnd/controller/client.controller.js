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

const AddClient = async (req, res, next) => {
  try {
    console.log("Body:", req.body);

    const { nome, contribuinte, contacto, tipoContacto } = req.body;

    const pool = await sql.connect(config);

    // Encontrar o cliente com base no contribuinte
    const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE Contribuinte = '${contribuinte}'
    `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length !== 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Cliente já existe.",
      });
    }

    const tipoContactoResultado = await pool.request().query(`
        SELECT TipoContactoID FROM TipoContacto WHERE DescContacto = '${tipoContacto}'
    `);

    if (tipoContactoResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Tipo de contacto não encontrado.",
      });
    }

    const tipoContactoId = tipoContactoResultado.recordset[0].TipoContactoID;

    // Criar contacto

    const resultado = await pool
      .request()
      .input("Nome", sql.VarChar, nome)
      .input("Contribuinte", sql.Int, contribuinte).query(`
    INSERT INTO Cliente (Nome, Contribuinte)
    VALUES (@Nome, @Contribuinte)
  `);

    const clienteId = clienteResultado.recordset[0].CID;

    const criarContacto = await pool
      .request()
      .input("Contacto", sql.Int || sql.VarChar, contacto)
      .input("TipoContactoTipoContactoID", sql.Int, tipoContactoId)
      .input("ClienteCID", sql.Int, clienteId).query(`
    INSERT INTO Contacto (Contacto, TipoContactoTipoContactoID, ClienteCID)
    VALUES (@Contacto, @TipoContactoTipoContactoID, @ClienteCID)
    `);

    const contactoId = await pool.request().query(`
        SELECT ContactoId FROM Contacto WHERE ClienteCID = ${clienteId}`);

    resultado = await pool.request().input("ContactoID", sql.Int, contactoId)
      .query(`
            UPDATE Cliente
            SET ContactoID = @ContactoId
            WHERE CID = ${clienteId}     
        `);

    if (resultado.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Cliente adicionado.",
      });
    }
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const RemoveClient = async (req, res) => {
  try {
    const { clienteId } = req.body;

    if (!clienteId || isNaN(clienteId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "ID do cliente inválido.",
      });
    }

    const pool = await sql.connect(config);

    const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE CID = '${clienteId}'
    `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Cliente não existe.",
      });
    }

    const resultado = await pool.request().query(`
        DELETE FROM Cliente WHERE CID = ${clienteId}
    `);

    if (resultado.rowsAffected[0] > 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Cliente removido com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao remover cliente:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { AddClient, RemoveClient };
