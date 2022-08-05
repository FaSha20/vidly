//Develope Vidly app


//imports
const express = require('express');
const app = express();
const genres = require('./vidlyGenres');

app.use(express.json());
app.use('/api/genres', genres);


//Listener...
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));



