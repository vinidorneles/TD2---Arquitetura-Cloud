-- Create Events table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Events')
BEGIN
    CREATE TABLE Events (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX),
        organizerId NVARCHAR(50) NOT NULL,
        category NVARCHAR(100),
        location NVARCHAR(500),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        startDate DATETIME NOT NULL,
        endDate DATETIME,
        imageUrl NVARCHAR(500),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create Reviews table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE Reviews (
        id INT PRIMARY KEY IDENTITY(1,1),
        eventId INT NOT NULL,
        userId NVARCHAR(50) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment NVARCHAR(MAX),
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE,
        CONSTRAINT UQ_User_Event_Review UNIQUE (eventId, userId)
    );
END
GO

-- Create EventInterest table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EventInterest')
BEGIN
    CREATE TABLE EventInterest (
        id INT PRIMARY KEY IDENTITY(1,1),
        eventId INT NOT NULL,
        userId NVARCHAR(50) NOT NULL,
        status NVARCHAR(20) NOT NULL CHECK (status IN ('interested', 'going')),
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE,
        CONSTRAINT UQ_User_Event_Interest UNIQUE (eventId, userId)
    );
END
GO

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Events_Category')
    CREATE INDEX IX_Events_Category ON Events(category);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Events_StartDate')
    CREATE INDEX IX_Events_StartDate ON Events(startDate);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Events_Location')
    CREATE INDEX IX_Events_Location ON Events(latitude, longitude);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reviews_EventId')
    CREATE INDEX IX_Reviews_EventId ON Reviews(eventId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EventInterest_EventId')
    CREATE INDEX IX_EventInterest_EventId ON EventInterest(eventId);
GO
