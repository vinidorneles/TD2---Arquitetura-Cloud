import { useState, useEffect } from 'react';
import { getEvents, globalSearch, deleteEvent } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, Filter, X, Plus, Edit, Trash2 } from 'lucide-react';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    setIsAdmin(userEmail === 'admin@vibra.com');
  }, []);

  const categories = [
    { value: '', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
    { value: 'Show', label: 'Show', color: 'bg-purple-100 text-purple-800' },
    { value: 'Festa', label: 'Festa', color: 'bg-pink-100 text-pink-800' },
    { value: 'Bar', label: 'Bar', color: 'bg-amber-100 text-amber-800' },
    { value: 'Balada', label: 'Balada', color: 'bg-fuchsia-100 text-fuchsia-800' },
    { value: 'Festival', label: 'Festival', color: 'bg-orange-100 text-orange-800' },
    { value: 'Teatro', label: 'Teatro', color: 'bg-blue-100 text-blue-800' },
    { value: 'Esporte', label: 'Esporte', color: 'bg-green-100 text-green-800' },
  ];

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

  const handleDeleteEvent = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteEvent(eventId);
      alert('Evento excluído com sucesso!');
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir evento');
    }
  };

  const handleEditEvent = (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-event/${eventId}`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await globalSearch(searchQuery);
      setEvents(response.data.events);
      setCategory(''); // Clear category filter when searching
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    loadEvents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Eventos
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar eventos, locais, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">
              Buscar
            </Button>
            {(searchQuery || category) && (
              <Button variant="outline" onClick={clearFilters} type="button">
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Categorias
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.value)}
                className="rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando eventos...</p>
            </div>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {events.length} evento(s) encontrado(s)
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Calendar className="h-16 w-16 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {event.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEditEvent(e, event.id)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => handleDeleteEvent(e, event.id)}
                            className="flex-1"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar seus filtros ou buscar por algo diferente
            </p>
            <Button onClick={clearFilters} variant="outline">
              Ver todos os eventos
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button - Only for Admin */}
      {isAdmin && (
        <button
          onClick={() => navigate('/create-event')}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 z-50"
          title="Criar Evento"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

export default Events;
