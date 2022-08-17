//Develope Vidly app
const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const app = express();
const genres = require('./routes/vidlyGenres');
const customers = require('./routes/vidlyCustomers');
const movies = require('./routes/vidlyMovies');
const rentals = require('./routes/vidlyRentals');
const users = require('./routes/vidlyUsers');
const auths = require('./routes/vidlyAuth');

/*check set environment variables */
if(!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not defind.');
    process.exit(1);
}

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDB...'));

    
/*routers */
app.use(express.json());
app.use('/api/genres', genres.router);
app.use('/api/customers', customers.router);
app.use('/api/movies', movies.router);
app.use('/api/rentals', rentals.router);
app.use('/api/users/', users.router);
app.use('/api/auths/', auths.router);


/*Listener...*/
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));



