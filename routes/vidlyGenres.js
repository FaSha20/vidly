const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const genreSchema = mongoose.Schema({
    name: String
})

const Genre = mongoose.model('Genre', new mongoose.Schema({
    name: String,
}));

//GET ALL
router.get('/',async(req, res) => {
    const genres = await Genre.find()
        .sort({name: 1});
    res.send(genres);
});

//GET BY ID
router.get('/:id', async(req, res) => {
    const genre = await Genre.findById(req.params.id);
    if(!genre){ return res.status(404).send('ID dose not find')};
    res.send(genre);
});

//CREATE 
/*
router.post(route, [middlewares](optional), route handler)
--"auth" middleware checks request header for x-auth header and a valid token--
--"admin" middleware checks tokens to see if they belong to admin users--
 */
router.post('/',  [auth, admin], async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
         return res.status(400).send(`Bad requetgdst: ${error.details[0].message} `);
    }
    let genre = new Genre({name : req.body.name });
    genre = await genre.save();
    res.send(genre);    
});


//UPDATE 
router.put('/:id', auth, async (req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const genre = await Genre.findByIdAndUpdate(req.params.id, {name: req.body.name},
        {new: true});
    if(!genre){ return res.status(404).send('ID dose not find') };
        
    res.send(genre);
});

//DELETE 
router.delete('/:id', [auth, admin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre){ return res.status(404).send('ID dose not find') };
    res.send(genre);
});


//functions
function nameValidation(genreName){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(genreName);
};

exports.router = router;
exports.genreSchema = genreSchema;
exports.Genre = Genre;