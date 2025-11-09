/**
 * GET EVENT BY ID ENDPOINT (Vertical Slice)
 */

const GetEventByIdHandler = require('./GetEventById.handler');

const handler = new GetEventByIdHandler();

module.exports = async (req, res) => {
  try {
    const event = await handler.handle(req.params.id);
    res.json(event);
  } catch (error) {
    console.error('Error in GetEventById:', error);

    if (error.message === 'Evento não encontrado') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Erro ao buscar evento',
      message: error.message
    });
  }
};
