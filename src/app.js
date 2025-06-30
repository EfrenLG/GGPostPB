const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const fileRoutes = require('./routes/fileRoutes');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const notFoundHandler = require('./middlewares/notFoundHandler');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.use(cookieParser());

app.use(express.json());

//PARA QUE NO ME BORRE EL TOKEN DE LAS COOKIES LA BASE DE LA URL TIENE QUE SER ASI!!!--> http://localhost:5500/
const allowedOrigins = [
  'https://gg-post-f.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/icons', express.static(path.join(__dirname, '..', 'icons')));
app.use('/post', express.static(path.join(__dirname, '..', 'post')));

app.use(helmet());
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});
app.use('/', apiLimiter);
app.get('/favicon.ico', (req, res) => res.status(204));

//RUTAS PUBLICAS
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);

//RUTAS PRIVADAS
app.use('/api/user', authMiddleware, userRoutes);

//Guardo el icono del usuario y la foto del post (imagenes)
app.use('/api/icon', authMiddleware, fileRoutes);

//Guardo el post (datos)
app.use('/api/post', authMiddleware, postRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;