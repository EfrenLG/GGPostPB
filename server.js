const dotenv = require("dotenv");
dotenv.config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const http = require('http');
const WebSocket = require('ws');
const { handleConnection } = require('./src/controllers/chatController');
const config = require('./src/config/configWS');

const port = config.port || 5173;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, ...config.wsOptions });

wss.on('connection', handleConnection);

const startServer = async () => {
    try {

        await connectDB();

        server.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });

    } catch (error) {
        console.log(`No se ha podido conectar con el servidor: ${error}`, error);
        process.exit(1);
    };
};

startServer();