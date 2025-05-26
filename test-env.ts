import './server/infrastructure/config/env';
console.log('APP_ENV', process.env.APP_ENV);
console.log('DATABASE_URL', process.env.DATABASE_URL);
console.log('JWT_SECRET starts', process.env.JWT_SECRET?.slice(0,5));
console.log('VITE_FIREBASE_API_KEY', process.env.VITE_FIREBASE_API_KEY);
