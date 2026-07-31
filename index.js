const express = require("express");
const app = express();
const cors = require('cors');
const { port } = require('./src/config');
const authRoutes = require('./src/routes/authRoutes');
const protectedRoutes = require('./src/routes/protectedRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const interestRoutes = require('./src/routes/interestRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Matrimony Application API Service is Online", version: "1.0.0" });
});

app.listen(port, () => {
  console.log(`Matrimony Server is running at http://localhost:${port}`);
});

