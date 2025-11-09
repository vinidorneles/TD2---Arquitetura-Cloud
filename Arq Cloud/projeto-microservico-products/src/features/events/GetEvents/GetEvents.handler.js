/**
 * GET EVENTS HANDLER (Vertical Slice Architecture)
 *
 * Handles listing events with filters, pagination, and geolocation search
 */

const { getPool, sql } = require('../../../config/database');

class GetEventsHandler {
  async handle(query) {
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
    } = query;

    // Build dynamic query
    const { sqlQuery, params } = this.buildQuery({
      category,
      startDate,
      endDate,
      latitude,
      longitude,
      radius,
      search
    });

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const pool = await getPool();

    // Get total count
    const countResult = await this.executeQuery(pool, sqlQuery, params, true);
    const total = countResult[0]?.total || 0;

    // Get paginated results
    const events = await this.executeQuery(pool, sqlQuery, params, false, skip, limit);

    return {
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  buildQuery(filters) {
    let query = 'SELECT * FROM Events WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = @category';
      params.push({ name: 'category', type: sql.NVarChar, value: filters.category });
    }

    if (filters.startDate) {
      query += ' AND startDate >= @startDate';
      params.push({ name: 'startDate', type: sql.DateTime, value: new Date(filters.startDate) });
    }

    if (filters.endDate) {
      query += ' AND startDate <= @endDate';
      params.push({ name: 'endDate', type: sql.DateTime, value: new Date(filters.endDate) });
    }

    if (filters.search) {
      query += ' AND (name LIKE @search OR description LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${filters.search}%` });
    }

    if (filters.latitude && filters.longitude) {
      // Haversine formula for geolocation search
      query += ` AND (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(@longitude)) +
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) <= @radius`;
      params.push(
        { name: 'latitude', type: sql.Decimal(10, 8), value: parseFloat(filters.latitude) },
        { name: 'longitude', type: sql.Decimal(11, 8), value: parseFloat(filters.longitude) },
        { name: 'radius', type: sql.Decimal(10, 2), value: parseFloat(filters.radius) }
      );
    }

    return { sqlQuery: query, params };
  }

  async executeQuery(pool, query, params, isCount = false, skip = 0, limit = 10) {
    const request = pool.request();

    // Add parameters
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    if (isCount) {
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as CountQuery`;
      const result = await request.query(countQuery);
      return result.recordset;
    } else {
      const paginatedQuery = `${query} ORDER BY startDate DESC OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      const result = await request.query(paginatedQuery);
      return result.recordset;
    }
  }
}

module.exports = GetEventsHandler;
