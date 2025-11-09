/**
 * CREATE EVENT ENDPOINT (Vertical Slice)
 * Thin adapter that connects HTTP to the handler
 */

const CreateEventHandler = require('./CreateEvent.handler');

const handler = new CreateEventHandler();

module.exports = async (req, res) => {
  try {
    const result = await handler.handle(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in CreateEvent:', error);

    if (error.message.includes('obrigatórios') || error.message.includes('inválida')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Erro ao criar evento',
      message: error.message
    });
  }
};
