const express = require('express');
const OpenAI = require('openai');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const fileRoutes = require('./routes/fileRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes'); // NUEVO: comentarios REST
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

const allowedOrigins = [
  'https://gg-post-pf.vercel.app',
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

// RUTAS PÚBLICAS
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);

// RUTAS PRIVADAS
app.get('/api/verify', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token válido', user: req.user });
});

app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/icon', authMiddleware, fileRoutes);
app.use('/api/post', authMiddleware, postRoutes);
app.use('/api/comments', authMiddleware, messageRoutes); // NUEVO: comentarios persistentes vía REST

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la IA' });
  }
});

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;