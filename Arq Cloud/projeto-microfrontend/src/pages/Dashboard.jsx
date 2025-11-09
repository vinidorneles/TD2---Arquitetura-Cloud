import { useState, useEffect } from 'react';
import { getDashboard, getNearbyEvents } from '../services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Bell, TrendingUp, Clock } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bem-vindo, {dashboard?.user?.name}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Descubra eventos incríveis perto de você
              </p>
            </div>
            <Link to="/events">
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Explorar Eventos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Events */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <CardTitle>Próximos Eventos</CardTitle>
                </div>
                <Link to="/events">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </div>
              <CardDescription>
                Eventos que você pode estar interessado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.upcomingEvents?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.upcomingEvents.slice(0, 5).map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {event.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {event.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento próximo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friends */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Amigos</CardTitle>
              </div>
              <CardDescription>
                {dashboard?.friends?.length || 0} amigos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.friends?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.friends.slice(0, 6).map((friendship) => (
                    <div key={friendship._id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {friendship.friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {friendship.friend.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Amigo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Você ainda não tem amigos</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Encontrar Amigos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nearby Events */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <CardTitle>Eventos Próximos</CardTitle>
              </div>
              <CardDescription>
                Baseado na sua localização
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nearbyEvents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {nearbyEvents.slice(0, 4).map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <div className="group relative overflow-hidden rounded-lg border hover:shadow-lg transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                            {event.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Configure sua localização para ver eventos próximos</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Atualizações recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.notifications?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="p-3 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
