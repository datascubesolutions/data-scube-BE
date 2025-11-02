require('dotenv').config();
const app = require('./src/app');

const PORT = 3001; // Use different port to avoid conflicts

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email config: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});

// Test basic endpoint
setTimeout(() => {
  const http = require('http');

  http
    .get(`http://localhost:${PORT}/api/health/live`, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log('\n🧪 Health check response:', JSON.parse(data));
        server.close();
        process.exit(0);
      });
    })
    .on('error', err => {
      console.error('❌ Health check failed:', err.message);
      server.close();
      process.exit(1);
    });
}, 2000);
