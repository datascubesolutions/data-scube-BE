// MongoDB initialization script for Docker
db = db.getSiblingDB('datascube');

// Create collections
db.createCollection('inquiries');

// Create indexes for better performance
db.inquiries.createIndex({ email: 1 });
db.inquiries.createIndex({ status: 1 });
db.inquiries.createIndex({ inquiryType: 1 });
db.inquiries.createIndex({ createdAt: -1 });
db.inquiries.createIndex({ priority: 1, status: 1 });

// Create a sample admin user (optional)
db.users.insertOne({
  name: 'Admin User',
  email: 'admin@datascube.com',
  role: 'admin',
  createdAt: new Date(),
});

print('Database initialized successfully!');
