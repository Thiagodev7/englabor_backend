const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EngLabor API',
      version: '1.0.0',
      description: 'API de gerenciamento de usuários e autenticação do EngLabor'
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Servidor local' }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        CreateUser: {
          type: 'object',
          required: ['nome','cpf','email','password'],
          properties: {
            nome:      { type: 'string', maxLength: 100 },
            cpf:       { type: 'string', maxLength: 14 },
            email:     { type: 'string', format: 'email', maxLength: 100 },
            telefone:  { type: 'string', maxLength: 20, nullable: true },
            password:  { type: 'string', minLength: 6 },
            role:      { type: 'string', enum: ['user','admin'], default: 'user' }
          }
        },
        UpdateUser: {
          type: 'object',
          required: ['nome','cpf','email','role'],
          properties: {
            nome:      { type: 'string', maxLength: 100 },
            cpf:       { type: 'string', maxLength: 14 },
            email:     { type: 'string', format: 'email', maxLength: 100 },
            telefone:  { type: 'string', maxLength: 20, nullable: true },
            role:      { type: 'string', enum: ['user','admin'] }
          }
        },
        ChangePassword: {
          type: 'object',
          required: ['oldPassword','newPassword'],
          properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] }
    ],
    tags: [
      { name: 'Usuários', description: 'Operações de gerenciamento de usuários' },
      { name: 'Auth',      description: 'Autenticação e login' }
    ]
  },
  apis: [ path.join(__dirname, '../src/routes/*.js') ]
};

module.exports = swaggerJsdoc(options);