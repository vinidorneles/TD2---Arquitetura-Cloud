const Database = require('better-sqlite3');
const path = require('path');

// Create SQLite database
const db = new Database(path.join(__dirname, '../../vibra_events.db'));

// Initialize database schema
const initDatabase = () => {
  // Create Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      organizerId TEXT NOT NULL,
      category TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      imageUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE,
      UNIQUE (eventId, userId)
    )
  `);

  // Create EventInterest table
  db.exec(`
    CREATE TABLE IF NOT EXISTS EventInterest (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('interested', 'going')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE,
      UNIQUE (eventId, userId)
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_category ON Events(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_startDate ON Events(startDate)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reviews_eventId ON Reviews(eventId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_interest_eventId ON EventInterest(eventId)`);

  console.log('✅ SQLite Database initialized');
};

module.exports = { db, initDatabase };
