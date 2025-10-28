const { getPool, sql } = require('../config/database');

const createReviewEvent = async (req, res) => {
  try {
    const { eventId, userId, rating, comment } = req.body;

    if (!eventId || !userId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'eventId, userId e rating são obrigatórios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating deve ser entre 1 e 5'
      });
    }

    const pool = await getPool();

    const eventResult = await pool.request()
      .input('eventId', sql.Int, eventId)
      .query('SELECT id FROM Events WHERE id = @eventId');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    const existingReview = await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Reviews WHERE eventId = @eventId AND userId = @userId');

    if (existingReview.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Usuário já avaliou este evento'
      });
    }

    const result = await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('userId', sql.NVarChar, userId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar, comment || '')
      .query(`
        INSERT INTO Reviews (eventId, userId, rating, comment)
        OUTPUT INSERTED.*
        VALUES (@eventId, @userId, @rating, @comment)
      `);

    const review = result.recordset[0];

    console.log(`✅ Review created via event: ${review.id}`);

    res.status(201).json({
      success: true,
      message: 'Review criado com sucesso via evento',
      data: review,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in createReviewEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar evento de review',
      error: error.message
    });
  }
};

module.exports = createReviewEvent;
