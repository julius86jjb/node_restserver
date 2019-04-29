// ==================================
// Puerto
// ==================================

process.env.PORT = process.env.PORT || 3000;


// =================================
// Entorno
// =================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// =================================
// Base de Datos
// =================================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URL
}

process.env.URLDB = urlDB;

// =================================
// Vencimiento Token
// =================================

// { expiresIn: 60 * 60 * 24 * 30 } => 60seg, 60min, 24h, 30días

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// =================================
// SEED (semilla de autenticación)
// =================================

// 'este-es-el-seed-desarrollo'

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// =================================
// Google Client ID
// =================================

process.env.CLIENT_ID = process.env.CLIENT_ID || '4228288957-gt3phse9farsf129qb3vljjia09kgtrm.apps.googleusercontent.com';