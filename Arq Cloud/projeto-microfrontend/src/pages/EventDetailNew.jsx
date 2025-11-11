import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, getReviews, createReviewViaEvent, getInterests, createInterest, updateInterest, deleteInterest } from '../services/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, DollarSign, Star, Edit, ArrowLeft, Heart, Check } from 'lucide-react';

function EventDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [interests, setInterests] = useState({ interested: [], going: [] });
  const [totalInterested, setTotalInterested] = useState(0);
  const [totalGoing, setTotalGoing] = useState(0);
  const [userInterest, setUserInterest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    setIsAdmin(userEmail === 'admin@vibra.com');
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      // Carregar evento primeiro
      const eventRes = await getEventById(id);
      console.log('Event response:', eventRes);
      setEvent(eventRes.data);

      // Reviews desabilitado
      setReviews([]);

      try {
        const interestsRes = await getInterests(id);
        const interestsData = interestsRes.data;
        setTotalInterested(interestsData.totalInterested || 0);
        setTotalGoing(interestsData.totalGoing || 0);

        // Agrupar por tipo
        const interestedUsers = interestsData.interests?.filter(i => i.status === 'interested') || [];
        const goingUsers = interestsData.interests?.filter(i => i.status === 'going') || [];
        setInterests({ interested: interestedUsers, going: goingUsers });

        // Verificar se o usuário já demonstrou interesse
        const userId = localStorage.getItem('userId');
        const existingInterest = interestsData.interests?.find(i => i.userId === userId);
        setUserInterest(existingInterest || null);
      } catch (err) {
        console.error('Error loading interests:', err);
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (status) => {
    try {
      if (userInterest) {
        if (userInterest.status === status) {
          // Se clicar no mesmo status, remove o interesse
          await deleteInterest(id, userInterest.id);
          setUserInterest(null);
        } else {
          // Se clicar em status diferente, atualiza
          await updateInterest(id, userInterest.id, { status });
          setUserInterest({ ...userInterest, status });
        }
      } else {
        // Cria novo interesse
        const result = await createInterest(id, { status });
        setUserInterest(result.data);
      }
      loadEventDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao registrar interesse');
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

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-6 text-center text-red-600">Evento não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {isAdmin && (
            <Button
              onClick={() => navigate(`/edit-event/${id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Evento
            </Button>
          )}
        </div>

        {/* Event Hero Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                  {event.category}
                </span>
                <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
                <p className="text-white/90">
                  Organizado por: Admin VIBRA
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-semibold">
                    {new Date(event.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-semibold">{event.location?.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pessoas</p>
                  <p className="font-semibold">{totalInterested + totalGoing} interessadas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avaliação</p>
                  <p className="font-semibold">{event.averageRating?.toFixed(1) || 'N/A'} ⭐</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Interested Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pessoas Interessadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Confirmados */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Vão participar ({totalGoing})</h4>
                    </div>
                    {interests.going.length === 0 ? (
                      <p className="text-gray-500 text-sm pl-6">Ninguém confirmou ainda</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-6">
                        {interests.going.map((interest, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs">
                                {interest.userId?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">{interest.userId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interessados */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">Interessados ({totalInterested})</h4>
                    </div>
                    {interests.interested.length === 0 ? (
                      <p className="text-gray-500 text-sm pl-6">Seja o primeiro a demonstrar interesse!</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-6">
                        {interests.interested.map((interest, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                {interest.userId?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">{interest.userId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Avaliações</CardTitle>
                  {!showReviewForm && (
                    <Button onClick={() => setShowReviewForm(true)} size="sm">
                      Avaliar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <Label htmlFor="rating">Nota</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className={`p-2 rounded ${
                              reviewData.rating >= star
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="comment">Comentário</Label>
                      <textarea
                        id="comment"
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Enviar</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Ainda não há avaliações.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                {getInitials(review.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{review.user?.name}</p>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{event.location}</p>
              </CardContent>
            </Card>

            {/* Interest Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Você tem interesse?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className={`w-full ${
                    userInterest?.status === 'going'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleInterest('going')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {userInterest?.status === 'going' ? 'Vou participar!' : 'Vou participar'}
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${
                    userInterest?.status === 'interested'
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : ''
                  }`}
                  onClick={() => handleInterest('interested')}
                >
                  <Heart className={`h-4 w-4 mr-2 ${userInterest?.status === 'interested' ? 'fill-current' : ''}`} />
                  {userInterest?.status === 'interested' ? 'Tenho interesse!' : 'Tenho interesse'}
                </Button>
                {userInterest && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Clique novamente para remover sua escolha
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailNew;
