const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {genreSchema} = require('./vidlyGenres');
const {Genre} = require('./vidlyGenres');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    genre: genreSchema,
    numberInStock: {type: Number, default: 0},
    dailyRentalRate: {type: Number, default: 0}
})

const Movie = mongoose.model('Movie', movieSchema);


//GET ALL
router.get('/', async(req, res) => {
    const movies = await Movie.find()
        .sort({name: 1});
    res.send(movies);
});

//GET BY ID
router.get('/:id', async(req, res) => {
    const movie = await Movie.findById(req.params.id);
    if(!movie){ return res.status(404).send('ID dose not find')};
    res.send(movie);
});

//CREATE 
router.post('/', auth, async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) { return res.status(400).send('Invalid Genre.');}

    let movie = new Movie({
        title : req.body.title,
        genre:{
            id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    movie = await movie.save();
    res.send(movie);    
});


//UPDATE 
router.put('/:id', auth, async (req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, {name: req.body.name},
        {new: true});
    if(!movie){ return res.status(404).send('ID dose not find') };
        
    res.send(movie);
});

//DELETE 
router.delete('/:id', [auth, admin], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if(!movie){ return res.status(404).send('ID dose not find') };
    res.send(movie);
});


//functions
function nameValidation(movieName){
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        genreId:Joi.string().min(3).required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number()
    });
    return schema.validate(movieName);
};


exports.router = router;
exports.Movie = Movie;
exports.movieSchema = movieSchema;