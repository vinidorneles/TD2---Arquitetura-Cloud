/**
 * CREATE EVENT HANDLER (Vertical Slice Architecture)
 *
 * This file contains EVERYTHING needed for the "Create Event" feature:
 * - Request validation
 * - Business logic
 * - Database access
 * - Response formatting
 *
 * Each feature is self-contained (vertical slice)
 */

const { getPool, sql } = require('../../../config/database');

class CreateEventHandler {
  async handle(request) {
    // 1. Validate input
    const validation = this.validate(request);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. Execute business logic
    const event = await this.createEvent(request);

    // 3. Return response
    return {
      success: true,
      data: event,
      message: 'Evento criado com sucesso'
    };
  }

  validate(request) {
    const { name, description, organizerId, category, location, latitude, longitude, startDate } = request;

    if (!name || !description || !organizerId || !category || !location || !startDate) {
      return {
        isValid: false,
        error: 'Campos obrigatórios: name, description, organizerId, category, location, startDate'
      };
    }

    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      return { isValid: false, error: 'Latitude inválida' };
    }

    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      return { isValid: false, error: 'Longitude inválida' };
    }

    return { isValid: true };
  }

  async createEvent(data) {
    const {
      name,
      description,
      organizerId,
      category,
      location,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl
    } = data;

    const pool = await getPool();

    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('organizerId', sql.NVarChar, organizerId)
      .input('category', sql.NVarChar, category)
      .input('location', sql.NVarChar, location)
      .input('latitude', sql.Decimal(10, 8), latitude || null)
      .input('longitude', sql.Decimal(11, 8), longitude || null)
      .input('startDate', sql.DateTime, new Date(startDate))
      .input('endDate', sql.DateTime, endDate ? new Date(endDate) : null)
      .input('imageUrl', sql.NVarChar, imageUrl || null)
      .query(`
        INSERT INTO Events (name, description, organizerId, category, location, latitude, longitude, startDate, endDate, imageUrl)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @organizerId, @category, @location, @latitude, @longitude, @startDate, @endDate, @imageUrl)
      `);

    return result.recordset[0];
  }
}

module.exports = CreateEventHandler;
