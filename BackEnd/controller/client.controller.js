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

    if (!nome || !contribuinte || !contacto || !tipoContacto) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Preencha os campos.",
      });
    }

    const pool = await sql.connect(config);

    // Encontrar o cliente com base no contribuinte
    const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE Contribuinte = '${contribuinte}'
    `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
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

    const clienteInserido = await pool
      .request()
      .input("Nome", sql.VarChar, nome)
      .input("Contribuinte", sql.Int, contribuinte).query(`
    INSERT INTO Cliente (Nome, Contribuinte)
    VALUES (@Nome, @Contribuinte)
    SELECT SCOPE_IDENTITY() AS CID;
  `);

    const clienteId = clienteInserido.recordset[0].CID;

    // Insere contacto
    await pool
      .request()
      .input("Contacto", sql.Int, contacto)
      .input("TipoContactoTipoContactoID", sql.Int, tipoContactoId)
      .input("ClienteCID", sql.Int, clienteId).query(`
    INSERT INTO Contacto (Contacto, TipoContactoTipoContactoID, ClienteCID)
    VALUES (@Contacto, @TipoContactoTipoContactoID, @ClienteCID)
    `);

    const contactoId = await pool.request().query(`
        SELECT TOP 1 ContactoId FROM Contacto WHERE ClienteCID = ${clienteId}`);

    const contactoIdFinal = contactoId.recordset[0].ContactoId;

    const resultado = await pool
      .request()
      .input("ContactoContactoID", sql.Int, contactoIdFinal).query(`
      UPDATE Cliente
      SET ContactoContactoID = @ContactoContactoID
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
    const { contribuinte } = req.body;

    if (!contribuinte || isNaN(contribuinte)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Contribuinte inválido.",
      });
    }

    const pool = await sql.connect(config);

    const clienteResultado = await pool.request().query(`
        SELECT CID FROM Cliente WHERE Contribuinte = '${contribuinte}'
    `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Cliente não existe.",
      });
    }

    const resultado = await pool.request().query(`
        DELETE FROM Cliente WHERE Contribuinte = ${contribuinte}
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


const UpdateClient = async (req, res, next) => {
  try {
    console.log("Body:", req.body);

    const { nome, contribuinteA, contribuinte, contacto, tipoContacto } = req.body;

    const pool = await sql.connect(config);

    // Encontrar o cliente com base no contribuinte
    const clienteResultado = await pool.request().query(`
      UPDATE Cliente
      SET 
          Nome = '${nome}', 
          Contribuinte = '${contribuinte}'
      WHERE 
          Contribuinte = '${contribuinteA}'
  `);

  const contactoResultado = await pool.request().query(`
    UPDATE Contacto
      SET 
          Contacto = '${contacto}'
      WHERE 
          ContactoID = (
              SELECT ContactoContactoID
              FROM Cliente
              WHERE Contribuinte = '${contribuinte}'
          );
    `);

    const tipoContactoResultado = await pool.request().query(`
      UPDATE TipoContacto
      SET 
          DescContacto = '${tipoContacto}'
      WHERE 
          TipoContactoID = (
              SELECT TipoContactoTipoContactoID
              FROM Contacto
              WHERE ContactoID = (
                  SELECT ContactoContactoID
                  FROM Cliente
                  WHERE Contribuinte = '${contribuinte}'
              )
          );

      `);

    // Verifica se o cliente existe
    if (clienteResultado.recordset.length !== 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Erro ao atualizar.",
      });
    }

    if (clienteResultado.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Cliente atualizado.",
      });
    }

    if (contactoResultado.recordset.length !== 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Erro ao atualizar.",
      });
    }

    if (contactoResultado.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Contacto atualizado.",
      });
    }

    if (tipoContactoResultado.recordset.length !== 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Erro ao atualizar.",
      });
    }

    if (tipoContactoResultado.rowsAffected[0] > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "TipoContacto atualizado.",
      });
    }
  } catch (error) {
    console.error("Erro ao atualizado cliente:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { AddClient, RemoveClient, UpdateClient };
