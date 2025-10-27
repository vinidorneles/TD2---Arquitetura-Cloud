const { getPool, sql } = require('../config/database');

// Get interests for an event
exports.getInterests = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const pool = await getPool();

    let query = 'SELECT * FROM EventInterest WHERE eventId = @eventId';
    const params = [{ name: 'eventId', type: sql.Int, value: parseInt(id) }];

    if (status) {
      query += ' AND status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    query += ' ORDER BY createdAt DESC';

    let request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);

    // Get totals
    const totalsResult = await pool.request()
      .input('eventId', sql.Int, id)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM EventInterest WHERE eventId = @eventId AND status = 'interested') as totalInterested,
          (SELECT COUNT(*) FROM EventInterest WHERE eventId = @eventId AND status = 'going') as totalGoing
      `);

    res.json({
      interests: result.recordset,
      totalInterested: totalsResult.recordset[0].totalInterested,
      totalGoing: totalsResult.recordset[0].totalGoing
    });
  } catch (error) {
    console.error('Error in getInterests:', error);
    res.status(500).json({ message: 'Erro ao buscar interesses', error: error.message });
  }
};

// Create interest
exports.createInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!['interested', 'going'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const pool = await getPool();

    // Check if event exists
    const eventResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM Events WHERE id = @id');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Check if user already has interest
    const existingInterest = await pool.request()
      .input('eventId', sql.Int, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM EventInterest WHERE eventId = @eventId AND userId = @userId');

    if (existingInterest.recordset.length > 0) {
      return res.status(400).json({ message: 'Interesse já registrado' });
    }

    // Create interest
    const result = await pool.request()
      .input('eventId', sql.Int, id)
      .input('userId', sql.NVarChar, userId)
      .input('status', sql.NVarChar, status)
      .query(`
        INSERT INTO EventInterest (eventId, userId, status)
        OUTPUT INSERTED.*
        VALUES (@eventId, @userId, @status)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error in createInterest:', error);
    res.status(500).json({ message: 'Erro ao criar interesse', error: error.message });
  }
};

// Update interest
exports.updateInterest = async (req, res) => {
  try {
    const { id, interestId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!['interested', 'going'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const pool = await getPool();

    // Check if interest exists and user owns it
    const interestResult = await pool.request()
      .input('id', sql.Int, interestId)
      .input('eventId', sql.Int, id)
      .query('SELECT userId FROM EventInterest WHERE id = @id AND eventId = @eventId');

    if (interestResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Interesse não encontrado' });
    }

    if (interestResult.recordset[0].userId !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Update interest
    const result = await pool.request()
      .input('id', sql.Int, interestId)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE EventInterest
        SET status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error in updateInterest:', error);
    res.status(500).json({ message: 'Erro ao atualizar interesse', error: error.message });
  }
};

// Delete interest
exports.deleteInterest = async (req, res) => {
  try {
    const { id, interestId } = req.params;
    const userId = req.userId;

    const pool = await getPool();

    // Check if interest exists and user owns it
    const interestResult = await pool.request()
      .input('id', sql.Int, interestId)
      .input('eventId', sql.Int, id)
      .query('SELECT userId FROM EventInterest WHERE id = @id AND eventId = @eventId');

    if (interestResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Interesse não encontrado' });
    }

    if (interestResult.recordset[0].userId !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await pool.request()
      .input('id', sql.Int, interestId)
      .query('DELETE FROM EventInterest WHERE id = @id');

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteInterest:', error);
    res.status(500).json({ message: 'Erro ao deletar interesse', error: error.message });
  }
};
