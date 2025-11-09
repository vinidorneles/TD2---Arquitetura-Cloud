/**
 * GET EVENTS ENDPOINT (Vertical Slice)
 */

const GetEventsHandler = require('./GetEvents.handler');

const handler = new GetEventsHandler();

module.exports = async (req, res) => {
  try {
    const result = await handler.handle(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error in GetEvents:', error);
    res.status(500).json({
      error: 'Erro ao buscar eventos',
      message: error.message
    });
  }
};
