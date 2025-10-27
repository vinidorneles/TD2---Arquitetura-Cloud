import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails, getReviews, createReviewViaEvent } from '../services/api';
import './EventDetail.css';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const [eventRes, reviewsRes] = await Promise.all([
        getEventDetails(id),
        getReviews(id)
      ]);

      setEvent(eventRes.data);
      setReviews(reviewsRes.data.reviews);
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await createReviewViaEvent(id, reviewData);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      loadEventDetails();
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao enviar avaliação');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!event) {
    return <div className="error">Evento não encontrado</div>;
  }

  return (
    <div className="event-detail">
      <div className="event-hero">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.name} className="event-hero-image" />
        )}
        <div className="event-hero-content">
          <span className="event-category">{event.category}</span>
          <h1>{event.name}</h1>
          <p className="event-organizer">
            Organizado por: {event.organizer?.name || 'Organizador'}
          </p>
        </div>
      </div>

      <div className="event-info-grid">
        <div className="event-main">
          <section className="event-section">
            <h2>Descrição</h2>
            <p>{event.description}</p>
          </section>

          <section className="event-section">
            <h2>Detalhes</h2>
            <div className="event-details">
              <div className="detail-item">
                <strong>Data:</strong>
                <span>{new Date(event.startDate).toLocaleString('pt-BR')}</span>
              </div>
              {event.endDate && (
                <div className="detail-item">
                  <strong>Termina:</strong>
                  <span>{new Date(event.endDate).toLocaleString('pt-BR')}</span>
                </div>
              )}
              <div className="detail-item">
                <strong>Local:</strong>
                <span>{event.location}</span>
              </div>
            </div>
          </section>

          <section className="event-section">
            <h2>Avaliações</h2>
            {event.averageRating > 0 && (
              <div className="rating-summary">
                <span className="rating-value">{event.averageRating.toFixed(1)}</span>
                <span className="rating-stars">⭐</span>
                <span className="rating-count">({event.totalReviews} avaliações)</span>
              </div>
            )}

            {!showReviewForm && (
              <button
                className="btn-primary"
                onClick={() => setShowReviewForm(true)}
              >
                Avaliar Evento
              </button>
            )}

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Nota:</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐</option>
                    <option value={4}>⭐⭐⭐⭐</option>
                    <option value={3}>⭐⭐⭐</option>
                    <option value={2}>⭐⭐</option>
                    <option value={1}>⭐</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comentário:</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    rows={4}
                    placeholder="Conte sobre sua experiência..."
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Enviar</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="event-sidebar">
          <div className="stats-card">
            <h3>Interesse</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{event.interests?.totalInterested || 0}</span>
                <span className="stat-label">Interessados</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{event.interests?.totalGoing || 0}</span>
                <span className="stat-label">Vão comparecer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
