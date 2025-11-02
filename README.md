# DataScube Microservice API

A production-ready Node.js microservice for inquiry management with enterprise-grade features, built following industry best practices used by companies like Flipkart and Amazon.

## 🚀 Features

- **Microservice Architecture**: Scalable, maintainable, and production-ready
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Email Service**: Beautiful HTML email templates with Nodemailer
- **Data Validation**: Comprehensive validation using Joi
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Logging**: Structured logging with Winston
- **Testing**: Comprehensive test suite with Jest
- **CI/CD**: GitHub Actions pipeline with Docker support
- **Monitoring**: Health checks and metrics endpoints
- **Documentation**: API documentation and deployment guides

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or cloud)
- npm >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DataScube
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Configure environment variables**
   Update the `.env` file with your settings:
   - MongoDB connection string
   - SMTP email configuration
   - Security keys
   - Company information

## 🚀 Quick Start

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
npm run docker:build
npm run docker:run
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Health Check

- `GET /health` - Service health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

#### Inquiries

- `POST /inquiries` - Create new inquiry
- `GET /inquiries` - Get all inquiries (with filtering & pagination)
- `GET /inquiries/:id` - Get inquiry by ID
- `PUT /inquiries/:id` - Update inquiry
- `DELETE /inquiries/:id` - Delete inquiry
- `GET /inquiries/stats` - Get inquiry statistics

### Example: Create Inquiry

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Tech Corp",
    "subject": "Product Inquiry",
    "message": "I am interested in learning more about your services and would like to schedule a demo.",
    "inquiryType": "sales",
    "priority": "medium"
  }'
```

### Response Format

```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "status": "pending",
    "createdAt": "2023-01-15T10:30:00.000Z"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔧 Development

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

### Git Hooks

The project uses Husky for git hooks:

- Pre-commit: Runs linting and formatting
- Pre-push: Runs tests

## 🐳 Docker Deployment

### Single Container

```bash
docker build -t datascube-api .
docker run -p 3000:3000 --env-file .env datascube-api
```

### Full Stack with Docker Compose

```bash
docker-compose up -d
```

This includes:

- Node.js API server
- MongoDB database
- Redis cache
- Nginx reverse proxy

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
JWT_SECRET=your-secure-jwt-secret
ADMIN_EMAIL=admin@yourcompany.com
```

### Security Checklist

- [ ] Update JWT secret
- [ ] Configure SMTP credentials
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure backup strategy

## 📊 Monitoring

### Health Checks

- **Liveness**: `GET /api/health/live`
- **Readiness**: `GET /api/health/ready`
- **Detailed Health**: `GET /api/health`

### Logging

Logs are written to:

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console (development only)

## 🔄 CI/CD Pipeline

The project includes a complete GitHub Actions pipeline:

1. **Test Stage**: Linting, testing, security scanning
2. **Build Stage**: Docker image building and pushing
3. **Deploy Stage**: Automated deployment to staging/production

### Pipeline Features

- Automated testing with MongoDB service
- Security scanning with Snyk
- Multi-platform Docker builds
- Automated deployments
- Coverage reporting

## 📁 Project Structure

```
DataScube/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── validators/     # Input validation
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── tests/              # Test files
├── logs/               # Log files
├── .github/workflows/  # CI/CD pipelines
├── docker-compose.yml  # Docker composition
├── Dockerfile          # Container definition
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Email: support@datascube.com
- Documentation: [API Docs](docs/api.md)
- Issues: [GitHub Issues](issues)

## 🔗 Related Projects

- [DataScube Frontend](../frontend) - React frontend application
- [DataScube Mobile](../mobile) - React Native mobile app
- [DataScube Analytics](../analytics) - Analytics microservice

---

Built with ❤️ by the DataScube Team
