const { getPool, sql } = require('../config/database');

exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      latitude,
      longitude,
      radius = 10,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const pool = await getPool();

    let query = 'SELECT * FROM Events WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = @category';
      params.push({ name: 'category', type: sql.NVarChar, value: category });
    }

    if (startDate) {
      query += ' AND startDate >= @startDate';
      params.push({ name: 'startDate', type: sql.DateTime, value: new Date(startDate) });
    }

    if (endDate) {
      query += ' AND startDate <= @endDate';
      params.push({ name: 'endDate', type: sql.DateTime, value: new Date(endDate) });
    }

    if (search) {
      query += ' AND (name LIKE @search OR description LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    if (latitude && longitude) {

      query += ` AND (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(@longitude)) +
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) <= @radius`;
      params.push(
        { name: 'latitude', type: sql.Decimal(10, 8), value: parseFloat(latitude) },
        { name: 'longitude', type: sql.Decimal(11, 8), value: parseFloat(longitude) },
        { name: 'radius', type: sql.Float, value: parseFloat(radius) }
      );
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');

    query += ' ORDER BY startDate DESC';
    let countRequest = pool.request();
    params.forEach(p => countRequest.input(p.name, p.type, p.value));
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
    params.push(
      { name: 'skip', type: sql.Int, value: skip },
      { name: 'limit', type: sql.Int, value: parseInt(limit) }
    );

    let request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);

    res.json({
      events: result.recordset,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ message: 'Erro ao buscar eventos', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const eventResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Events WHERE id = @id');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    const event = eventResult.recordset[0];

    const statsResult = await pool.request()
      .input('eventId', sql.Int, id)
      .query(`
        SELECT
          (SELECT AVG(CAST(rating AS FLOAT)) FROM Reviews WHERE eventId = @eventId) as averageRating,
          (SELECT COUNT(*) FROM Reviews WHERE eventId = @eventId) as totalReviews,
          (SELECT COUNT(*) FROM EventInterest WHERE eventId = @eventId AND status = 'interested') as totalInterested,
          (SELECT COUNT(*) FROM EventInterest WHERE eventId = @eventId AND status = 'going') as totalGoing
      `);

    const stats = statsResult.recordset[0];

    res.json({
      ...event,
      averageRating: stats.averageRating || 0,
      totalReviews: stats.totalReviews,
      totalInterested: stats.totalInterested,
      totalGoing: stats.totalGoing
    });
  } catch (error) {
    console.error('Error in getEventById:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      location,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl
    } = req.body;

    const organizerId = req.userId;

    const pool = await getPool();

    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('organizerId', sql.NVarChar, organizerId)
      .input('category', sql.NVarChar, category || '')
      .input('location', sql.NVarChar, location)
      .input('latitude', sql.Decimal(10, 8), latitude)
      .input('longitude', sql.Decimal(11, 8), longitude)
      .input('startDate', sql.DateTime, new Date(startDate))
      .input('endDate', sql.DateTime, endDate ? new Date(endDate) : null)
      .input('imageUrl', sql.NVarChar, imageUrl || '')
      .query(`
        INSERT INTO Events (name, description, organizerId, category, location, latitude, longitude, startDate, endDate, imageUrl)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @organizerId, @category, @location, @latitude, @longitude, @startDate, @endDate, @imageUrl)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error in createEvent:', error);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const eventResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT organizerId FROM Events WHERE id = @id');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    if (eventResult.recordset[0].organizerId !== req.userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const {
      name,
      description,
      category,
      location,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl
    } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('category', sql.NVarChar, category)
      .input('location', sql.NVarChar, location)
      .input('latitude', sql.Decimal(10, 8), latitude)
      .input('longitude', sql.Decimal(11, 8), longitude)
      .input('startDate', sql.DateTime, new Date(startDate))
      .input('endDate', sql.DateTime, endDate ? new Date(endDate) : null)
      .input('imageUrl', sql.NVarChar, imageUrl)
      .query(`
        UPDATE Events
        SET name = @name, description = @description, category = @category,
            location = @location, latitude = @latitude, longitude = @longitude,
            startDate = @startDate, endDate = @endDate, imageUrl = @imageUrl,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error in updateEvent:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const eventResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT organizerId FROM Events WHERE id = @id');

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    if (eventResult.recordset[0].organizerId !== req.userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Events WHERE id = @id');

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = ['Show', 'Festa', 'Bar', 'Balada', 'Festival', 'Teatro', 'Esporte', 'Outros'];
    res.json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
};
