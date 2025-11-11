const { getPool, sql } = require('../config/database');

exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;

    const pool = await getPool();

    let query = 'SELECT * FROM Reviews WHERE eventId = @eventId';
    const params = [{ name: 'eventId', type: sql.Int, value: parseInt(id) }];

    if (rating) {
      query += ' AND rating = @rating';
      params.push({ name: 'rating', type: sql.Int, value: parseInt(rating) });
    }

    // Get count first without ORDER BY
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    let countRequest = pool.request();
    params.forEach(p => countRequest.input(p.name, p.type, p.value));
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    query += ' ORDER BY createdAt DESC';

    const avgResult = await pool.request()
      .input('eventId', sql.Int, id)
      .query('SELECT AVG(CAST(rating AS FLOAT)) as averageRating FROM Reviews WHERE eventId = @eventId');
    const averageRating = avgResult.recordset[0].averageRating || 0;

    query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
    params.push(
      { name: 'skip', type: sql.Int, value: skip },
      { name: 'limit', type: sql.Int, value: parseInt(limit) }
    );

    let request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);

    res.json({
      reviews: result.recordset,
      total,
      averageRating,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getReviews:', error);
    res.status(500).json({ message: 'Erro ao buscar avaliações', error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Nota deve ser entre 1 e 5' });
    }

    const pool = await getPool();

    const eventResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM Events WHERE id = @id');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    const existingReview = await pool.request()
      .input('eventId', sql.Int, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Reviews WHERE eventId = @eventId AND userId = @userId');

    if (existingReview.recordset.length > 0) {
      return res.status(400).json({ message: 'Usuário já avaliou este evento' });
    }

    const result = await pool.request()
      .input('eventId', sql.Int, id)
      .input('userId', sql.NVarChar, userId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar, comment || '')
      .query(`
        INSERT INTO Reviews (eventId, userId, rating, comment)
        OUTPUT INSERTED.*
        VALUES (@eventId, @userId, @rating, @comment)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ message: 'Erro ao criar avaliação', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Nota deve ser entre 1 e 5' });
    }

    const pool = await getPool();

    const reviewResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT userId FROM Reviews WHERE id = @id');

    if (reviewResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    if (reviewResult.recordset[0].userId !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const updates = [];
    const params = [{ name: 'id', type: sql.Int, value: parseInt(id) }];

    if (rating !== undefined) {
      updates.push('rating = @rating');
      params.push({ name: 'rating', type: sql.Int, value: rating });
    }

    if (comment !== undefined) {
      updates.push('comment = @comment');
      params.push({ name: 'comment', type: sql.NVarChar, value: comment });
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const query = `
      UPDATE Reviews
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    let request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({ message: 'Erro ao atualizar avaliação', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const pool = await getPool();

    const reviewResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT userId FROM Reviews WHERE id = @id');

    if (reviewResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    if (reviewResult.recordset[0].userId !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Reviews WHERE id = @id');

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({ message: 'Erro ao deletar avaliação', error: error.message });
  }
};
