const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger/swagger');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const helloRoutes = require('./routes/hello');
const authMiddleware = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const empresasRoutes = require('./routes/empresas');
const funcionariosRoutes = require('./routes/funcionarios');
const equipamentosRoutes = require('./routes/equipamentos');
const medicaoRoutes = require('./routes/medicao');
const { port } = require('./config');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'Bem-vindo à EngLabor API! Use /api-docs para documentação.' });
});

app.enable('strict routing'); 
app.use('/api-docs',      swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs/',     swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/login', authRoutes);
app.use('/api/v1/empresas', empresasRoutes);
app.use('/api/v1/funcionarios', funcionariosRoutes);
app.use('/api/v1/equipamentos', equipamentosRoutes);
app.use('/api/v1/medicoes', medicaoRoutes);

// Rotas protegidas
app.use(authMiddleware);
app.use('/api/v1', helloRoutes);

// Erro central
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado. Veja /api-docs para rotas disponíveis.' });
});

app.listen(port, () => {
  console.log(`🚀 EngLabor API rodando em http://localhost:${port}`);
  console.log(`📖 Swagger em http://localhost:${port}/api-docs`);
});
