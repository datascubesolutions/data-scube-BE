const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function testSetup() {
  console.log('🔧 Testing DataScube setup...\n');

  // Test MongoDB connection
  try {
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb+srv://nikul:nikul@datascube.7fholtw.mongodb.net/?appName=dataScube'
    );
    console.log('✅ MongoDB connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  // Test email configuration
  try {
    console.log('\n2. Testing email configuration...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'apptestnodemailer730@gmail.com',
        pass: 'uajw muti dajb voyc',
      },
    });

    await transporter.verify();
    console.log('✅ Email configuration verified');
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
  }

  console.log('\n🎉 Setup test completed!');
}

testSetup().catch(console.error);
