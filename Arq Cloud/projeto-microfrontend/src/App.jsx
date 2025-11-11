import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetailNew from './pages/EventDetailNew';
import Friends from './pages/Friends';
import CreateEvent from './pages/CreateEvent';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    setIsAuthenticated(!!token);
    setIsAdmin(userEmail === 'admin@vibra.com');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="navbar-brand">VIBRA</div>
            <div className="navbar-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/events">Eventos</Link>
              <Link to="/friends" className="find-friends-btn">🔍 Encontrar Amigos</Link>
              {isAdmin && (
                <Link to="/create-event" className="create-event-btn">➕ Criar Evento</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
          </nav>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/events"
            element={
              isAuthenticated ? (
                <Events />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/events/:id"
            element={
              isAuthenticated ? (
                <EventDetailNew />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/friends"
            element={
              isAuthenticated ? (
                <Friends />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/create-event"
            element={
              isAuthenticated ? (
                isAdmin ? (
                  <CreateEvent />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/edit-event/:id"
            element={
              isAuthenticated ? (
                isAdmin ? (
                  <CreateEvent />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
