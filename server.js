const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Express অ্যাপ ইনিশিয়ালাইজেশন
const app = express();

// মিডলওয়্যার সেটআপ
app.use(cors()); // CORS এনাবল করা
app.use(express.json()); // JSON বডি পার্সার

// MongoDB কানেকশন
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// সাবস্ক্রাইবার মডেল ডিফাইনেশন
const Subscriber = mongoose.model('Subscriber', {
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// সাবস্ক্রাইব এন্ডপয়েন্ট
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // ভ্যালিডেশন চেক
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: "Email is required" 
      });
    }

    // ইমেইল সাবস্ক্রাইব করা
    const newSubscriber = await Subscriber.create({ email });
    
    res.status(201).json({ 
      success: true,
      message: "Thanks for subscribing!",
      data: newSubscriber
    });

  } catch (error) {
    // ডুপ্লিকেট ইমেইল এরর হ্যান্ডলিং
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "This email is already subscribed"
      });
    }
    
    // অন্যান্য এরর হ্যান্ডলিং
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// হেলথ চেক এন্ডপয়েন্ট
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date()
  });
});

// 404 হ্যান্ডলার
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// সার্ভার স্টার্ট
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
