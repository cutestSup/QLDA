# TimeSync Backend

TimeSync is a calendar management system that allows users to create, manage, and share calendars and events.

## Features

- User authentication and authorization
- Calendar management (create, update, delete)
- Event management with recurring events support
- Calendar sharing and collaboration
- Free/Busy time management
- Calendar synchronization

## Project Structure

```
timesync-backend/
├── config/              # Configuration files
│   ├── db.config.js
│   └── migrations/      # Database migrations
├── src/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middlewares
│   └── utils/          # Utility functions
├── tests/              # Test files
└── server.js           # Application entry point
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Run migrations:
   ```bash
   mysql -u your_username -p your_database < config/migrations/add_time_columns.sql
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Documentation

See `tests/api.test.http` for API examples and documentation.

## License

MIT
