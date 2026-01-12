require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', clientRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Activity System API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
