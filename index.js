require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('MAMS Backend Running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log(`Server started on port ${PORT}`);
});
