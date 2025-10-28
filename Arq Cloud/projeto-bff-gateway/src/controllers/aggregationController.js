const usersService = require('../services/usersService');
const eventsService = require('../services/eventsService');
const functionsService = require('../services/functionsService');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.token;

    const [user, events, friendships, timeline, notifications] = await Promise.all([
      usersService.getUserById(userId, token).catch(() => null),
      eventsService.getEvents({ limit: 5 }).catch(() => ({ events: [] })),
      usersService.getFriendships({ status: 'accepted' }, token).catch(() => []),
      usersService.getTimeline({ userId }, token).catch(() => ({ posts: [] })),
      functionsService.getUserNotifications(userId).catch(() => ({ notifications: [] }))
    ]);

    res.json({
      user,
      upcomingEvents: events.events,
      friends: friendships,
      recentPosts: timeline.posts,
      notifications: notifications.notifications || []
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar dashboard', error: error.message });
  }
};

exports.getEventDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.token;

    const [event, reviews, interests] = await Promise.all([
      eventsService.getEventById(id),
      eventsService.getReviews(id, { limit: 10 }),
      eventsService.getInterests(id, {})
    ]);

    let organizer = null;
    if (event.organizerId && token) {
      organizer = await usersService.getUserById(event.organizerId, token).catch(() => null);
    }

    res.json({
      ...event,
      organizer,
      reviews: reviews.reviews,
      averageRating: reviews.averageRating,
      totalReviews: reviews.total,
      interests: {
        totalInterested: interests.totalInterested,
        totalGoing: interests.totalGoing
      }
    });
  } catch (error) {
    console.error('Error in getEventDetail:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do evento', error: error.message });
  }
};

exports.getNearbyEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.token;
    const { radius = 10 } = req.query;

    const user = await usersService.getUserById(userId, token);

    if (!user.location || !user.location.lat || !user.location.lng) {
      return res.status(400).json({ message: 'Localização do usuário não definida' });
    }

    const events = await eventsService.getEvents({
      latitude: user.location.lat,
      longitude: user.location.lng,
      radius,
      limit: 20
    });

    res.json({
      userLocation: user.location,
      radius,
      events: events.events,
      total: events.total
    });
  } catch (error) {
    console.error('Error in getNearbyEvents:', error);
    res.status(500).json({ message: 'Erro ao buscar eventos próximos', error: error.message });
  }
};

exports.getFriendActivities = async (req, res) => {
  try {
    const { friendId } = req.params;
    const token = req.token;

    const [friend, timeline] = await Promise.all([
      usersService.getUserById(friendId, token),
      usersService.getTimeline({ userId: friendId, limit: 20 }, token)
    ]);

    res.json({
      friend,
      activities: timeline.posts
    });
  } catch (error) {
    console.error('Error in getFriendActivities:', error);
    res.status(500).json({ message: 'Erro ao buscar atividades do amigo', error: error.message });
  }
};

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const token = req.token;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Query deve ter no mínimo 2 caracteres' });
    }

    const [users, events] = await Promise.all([
      usersService.getUsers({ search: q, limit: 10 }, token).catch(() => ({ users: [] })),
      eventsService.getEvents({ search: q, limit: 10 }).catch(() => ({ events: [] }))
    ]);

    res.json({
      query: q,
      users: users.users || [],
      events: events.events || [],
      totalResults: (users.users?.length || 0) + (events.events?.length || 0)
    });
  } catch (error) {
    console.error('Error in globalSearch:', error);
    res.status(500).json({ message: 'Erro na busca global', error: error.message });
  }
};

module.exports = exports;
