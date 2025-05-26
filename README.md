# HabitMaster

## Description

HabitMaster is a React application designed to help you track and manage your daily habits. It allows you to create, edit, and delete habits, monitor your progress, and receive reminders to stay motivated.

## Main Features

- Create, edit, and delete habits
- Track daily habit completion
- Set reminders and notifications
- View habit statistics and streaks

## Technologies Used

- React
- JavaScript (ES6+)
- CSS Modules

## Requirements and Environment Variables

- Node.js v14 or higher
- npm v6 or higher

Create a `.env` file in the project root and add the following environment variables:

```bash
# Database connection URL (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/habittracker

# JWT settings
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# (Optional) Vite client base URL (adjust if running API on a different host)
# VITE_API_URL=http://localhost:5000
```

## Installation

```bash
git clone https://github.com/yourusername/HabitMaster.git
cd HabitMaster
npm install
```

### Running in Development

```bash
npm start
```

Open your browser and go to `http://localhost:3000`.

### Production Build

```bash
npm run buil
```

The production-ready files will be in the `build/` directory.

## Project Structure

```
HabitMaster/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

## Author

- Mike B – [https://github.com/mikeb](https://github.com/mikeb)