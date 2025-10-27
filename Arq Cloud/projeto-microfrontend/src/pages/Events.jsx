import { useState, useEffect } from 'react';
import { getEvents, globalSearch } from '../services/api';
import { Link } from 'react-router-dom';
import './Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const categories = ['Show', 'Festa', 'Bar', 'Balada', 'Festival', 'Teatro', 'Esporte'];

  useEffect(() => {
    loadEvents();
  }, [category]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;

      const response = await getEvents(params);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await globalSearch(searchQuery);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Eventos</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <div className="categories">
          <button
            className={!category ? 'category-btn active' : 'category-btn'}
            onClick={() => setCategory('')}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? 'category-btn active' : 'category-btn'}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="event-card">
                {event.imageUrl && (
                  <div className="event-image">
                    <img src={event.imageUrl} alt={event.name} />
                  </div>
                )}
                <div className="event-content">
                  <span className="event-category">{event.category}</span>
                  <h3>{event.name}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-meta">
                    <span className="event-date">
                      {new Date(event.startDate).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="event-location">{event.location}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="empty-state">Nenhum evento encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Events;
