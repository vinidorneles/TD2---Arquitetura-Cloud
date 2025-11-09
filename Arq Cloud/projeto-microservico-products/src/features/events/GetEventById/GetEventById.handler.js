/**
 * GET EVENT BY ID HANDLER (Vertical Slice Architecture)
 */

const { getPool, sql } = require('../../../config/database');

class GetEventByIdHandler {
  async handle(eventId) {
    if (!eventId) {
      throw new Error('Event ID é obrigatório');
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, eventId)
      .query('SELECT * FROM Events WHERE id = @id');

    if (result.recordset.length === 0) {
      throw new Error('Evento não encontrado');
    }

    return result.recordset[0];
  }
}

module.exports = GetEventByIdHandler;
