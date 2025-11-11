import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, getEventById } from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    lat: '',
    lng: '',
    category: 'Música',
    capacity: '',
    ticketPrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await getEventById(id);
      const event = response.data;
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        address: event.location?.address || '',
        city: event.location?.city || '',
        state: event.location?.state || '',
        country: event.location?.country || 'Brasil',
        lat: event.location?.lat || '',
        lng: event.location?.lng || '',
        category: event.category,
        capacity: event.capacity,
        ticketPrice: event.ticketPrice
      });
    } catch (err) {
      setError('Erro ao carregar evento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const eventData = {
        name: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: `${formData.address}, ${formData.city}, ${formData.state}`,
        latitude: parseFloat(formData.lat) || -25.4195,
        longitude: parseFloat(formData.lng) || -49.2646,
        category: formData.category
      };

      await createEvent(eventData);
      alert(isEditing ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {isEditing ? 'Editar Evento' : 'Criar Novo Evento'}
          </h1>
          <p className="text-gray-600">Preencha os detalhes do seu evento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Evento *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Festival de Música VIBRA"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva os detalhes do evento..."
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="Música">Música</option>
                      <option value="Esportes">Esportes</option>
                      <option value="Arte">Arte</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Gastronomia">Gastronomia</option>
                      <option value="Educação">Educação</option>
                      <option value="Entretenimento">Entretenimento</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="capacity" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacidade *
                    </Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="Ex: 500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Data e Horário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Início *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Término *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </h3>
                <div>
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ex: Rua das Flores, 123"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Curitiba"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Ex: PR"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Brasil"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude (opcional)</Label>
                    <Input
                      id="lat"
                      name="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={handleChange}
                      placeholder="Ex: -25.4195"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lng">Longitude (opcional)</Label>
                    <Input
                      id="lng"
                      name="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={handleChange}
                      placeholder="Ex: -49.2646"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <Label htmlFor="ticketPrice" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Preço do Ingresso (R$) *
                </Label>
                <Input
                  id="ticketPrice"
                  name="ticketPrice"
                  type="number"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : isEditing ? 'Atualizar Evento' : 'Criar Evento'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateEvent;
