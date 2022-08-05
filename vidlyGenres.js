const express = require('express');
const router = express.Router();
const Joi = require('joi');


const genresDB = [
    { id: 1, name: 'Horror'},
    { id: 2, name: 'Romance'},
    { id: 3, name: 'Action'}
];
   

//GET ALL
router.get('/', (req, res) => {
    res.send(genresDB);
});

//GET BY ID
router.get('/:id', (req, res) => {
    const genre = genresDB.find(c => c.id === parseInt(req.params.id));
    if(!genre){ return res.status(404).send('ID dose not find')};
    res.send(genre);
});

//CREATE 
router.post('/', (req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
         return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const newGenre = {
        id : genresDB.length + 1,
        name : req.body.name
    }
    genresDB.push(newGenre);
    res.send(newGenre);    
});


//UPDATE 
router.put('/:id', (req, res) => {
    const genre = genresDB.find(c => c.id === parseInt(req.params.id));
    if(!genre){ return res.status(404).send('ID dose not find') };
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    genre.name = req.body.name;
    res.send(genre);
});

//DELETE 
router.delete('/:id', (req, res) => {
    const genre = genresDB.find(c => c.id === parseInt(req.params.id));
    if(!genre){ return res.status(404).send('ID dose not find') };
    const index = genresDB.indexOf(genre);
    genresDB.splice(index, 1);
    res.send(genre);
});


//functions
function nameValidation(genreName){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(genreName);
};

module.exports = router;