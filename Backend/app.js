const express = require('express');
const cors = require('cors');
const lexerRoutes = require('./src/Routes/lexerRoutes');

const app = express();

app.use(cors());


app.use(express.json());

app.use('/api', lexerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Plumb backend running on http://localhost:${PORT}`);
});

module.exports = app;
