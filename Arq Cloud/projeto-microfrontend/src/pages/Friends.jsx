import { useState, useEffect } from 'react';
import { getUsers, getFriendships, createFriendship, deleteFriendship } from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Users, UserMinus } from 'lucide-react';

function Friends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadAllUsers();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await getFriendships();
      setFriends(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar amigos:', err);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers('');
      console.log('Usuários carregados:', response.data);
      setAllUsers(response.data.users || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const addFriend = async (friendId) => {
    try {
      await createFriendship(friendId);
      alert('Amigo adicionado com sucesso!');
      loadFriends();
      loadAllUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao adicionar amigo');
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return;
    try {
      await deleteFriendship(friendshipId);
      alert('Amigo removido com sucesso!');
      loadFriends();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover amigo');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = allUsers.filter(user => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🔍 Encontrar Amigos
          </h1>
          <p className="text-gray-600">Busque e conecte-se com outras pessoas</p>
        </div>

        {/* Search Bar - DESTAQUE */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Buscar Pessoas</h2>
          </div>
          <Input
            type="text"
            placeholder="🔍 Digite o nome ou email para buscar..."
            value={searchTerm}
            onChange={handleSearch}
            className="text-lg p-6 border-2 border-purple-300 focus:border-purple-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            {loading ? 'Carregando...' : `${filteredUsers.length} pessoa(s) encontrada(s)`}
          </p>
        </div>

        {/* Lista de Usuários */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {searchTerm ? 'Resultados da Busca' : 'Todas as Pessoas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => addFriend(user._id)}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma pessoa encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meus Amigos ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Você ainda não tem amigos.</p>
                <p className="text-sm text-gray-400 mt-2">Use a busca acima para encontrar pessoas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map(friendship => {
                  const friend = friendship.friend || friendship.user;
                  return (
                    <div
                      key={friendship._id}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend?.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {getInitials(friend?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{friend?.name}</p>
                        <p className="text-sm text-gray-600">{friend?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Amigos desde {new Date(friendship.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => removeFriend(friendship._id)}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Friends;
