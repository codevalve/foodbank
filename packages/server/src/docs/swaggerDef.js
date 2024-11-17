module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Food Bank Management API',
    version: '1.0.0',
    description: 'API documentation for the Food Bank Management System',
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Organizations',
      description: 'Organization management endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Inventory',
      description: 'Inventory management endpoints',
    },
    {
      name: 'Volunteers',
      description: 'Volunteer management endpoints',
    },
    {
      name: 'Clients',
      description: 'Client management endpoints',
    },
  ],
};
