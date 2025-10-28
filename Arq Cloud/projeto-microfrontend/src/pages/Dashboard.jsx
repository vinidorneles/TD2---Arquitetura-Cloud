import { useState, useEffect } from 'react';
import { getDashboard, getNearbyEvents } from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, nearbyRes] = await Promise.all([
        getDashboard(),
        getNearbyEvents(10).catch(() => ({ data: { events: [] } }))
      ]);

      setDashboard(dashboardRes.data);
      setNearbyEvents(nearbyRes.data.events || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bem-vindo, {dashboard?.user?.name}!</h1>
        <p>Descubra eventos incríveis perto de você</p>
      </div>

      <div className="dashboard-grid">
        {}
        <div className="dashboard-card">
          <h2>Próximos Eventos</h2>
          {dashboard?.upcomingEvents?.length > 0 ? (
            <div className="events-list">
              {dashboard.upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="event-item">
                  <div className="event-info">
                    <h3>{event.name}</h3>
                    <p className="event-category">{event.category}</p>
                    <p className="event-date">
                      {new Date(event.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">Nenhum evento próximo</p>
          )}
        </div>

        {}
        <div className="dashboard-card">
          <h2>Eventos Próximos</h2>
          {nearbyEvents.length > 0 ? (
            <div className="events-list">
              {nearbyEvents.slice(0, 5).map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="event-item">
                  <div className="event-info">
                    <h3>{event.name}</h3>
                    <p className="event-location">{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">Configure sua localização para ver eventos próximos</p>
          )}
        </div>

        {}
        <div className="dashboard-card">
          <h2>Amigos ({dashboard?.friends?.length || 0})</h2>
          {dashboard?.friends?.length > 0 ? (
            <div className="friends-list">
              {dashboard.friends.slice(0, 5).map((friendship) => (
                <div key={friendship._id} className="friend-item">
                  <div className="friend-avatar">
                    {friendship.friend.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{friendship.friend.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Você ainda não tem amigos</p>
          )}
        </div>

        {}
        <div className="dashboard-card">
          <h2>Notificações</h2>
          {dashboard?.notifications?.length > 0 ? (
            <div className="notifications-list">
              {dashboard.notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="notification-item">
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Nenhuma notificação</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
