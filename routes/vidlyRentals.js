const mongoose = require('mongoose');
const express = require('express');
const fawn = require('fawn');
const router = express.Router();
const Joi = require('joi');
const {Customer, customerSchema} = require('./vidlyCustomers');
const {Movie, movieSchema} = require('./vidlyMovies');
const Fawn = require('fawn/lib/fawn');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

fawn.init(mongoose);


const rentalSchema = mongoose.Schema({
    customer: customerSchema,
    movie: movieSchema,
    dateOut:{
        type: String,
        required: true,
        default: "Date.now"
    },
    dateTurned:{
        type: Date,
    },
    rentalFee:{
        type: Number,
        min: 0,
        required: true
    }
})

const Rental = mongoose.model('Rental', rentalSchema);

//GET ALL
router.get('/', async(req, res) => {
    const rentals = await Rental.find()
        .sort({dateOut: -1});
    res.send(rentals);
});

//GET BY ID
router.get('/:id', async(req, res) => {
    const rental = await Rental.findById(req.params.id);
    if(!rental){ return res.status(404).send('ID dose not find')};
    res.send(rental);
});

//CREATE 
router.post('/', auth, async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad requetgdst: ${error.details[0].message} `);
    }
    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie!');
    if(movie.numberInStock == 0) return res.status(400).send('Not available in stock!');

    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer!');

    let rental = new Rental({
        customer: {
            id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            id: movie._id,
            title: movie.title,
            genre: movie.genre,
            numberInStock: movie.numberInStock,
            dailyRentalRate: movie.dailyRentalRate
        },
        dateOut: setDateOut(new Date()),
        rentalFee: movie.dailyRentalRate * 30
    });
    try{
        new Fawn.Task()                             /*2 phase commit (transaction) */
            .save('rentals', rental)
            .update('movies', {_id: movie._id}, {
                $inc: {numberInStock: -1}
            })
            .run();
        res.send(rental)
    }
    catch(ex){
        res.status(500).send('Internal server error.');
    }
    
    // rental = await rental.save();                /*with out transaction */
    // movie.numberInStock--;
    // movie.save();
    // res.send(rental);    
});


//UPDATE 
router.put('/:id', auth, async (req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie!');
    if(movie.numberInStock == 0) return res.status(400).send('Not available in stock!');
    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer!');

    const rental = await Rental.findByIdAndUpdate(req.params.id, {
        customer: {
            id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            id: movie._id,
            title: movie.title,
            genre: movie.genre,
            numberInStock: movie.numberInStock,
            dailyRentalRate: movie.dailyRentalRate
        },
    },{new: true});

    if(!rental){ return res.status(404).send('ID dose not find') };
    res.send(rental);
});

//DELETE 
router.delete('/:id', [auth, admin], async (req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);
    if(!rental){ return res.status(404).send('ID dose not find') };
    res.send(rental);
});


//functions
function nameValidation(rentalName){
    const schema = Joi.object({
        customerId: Joi.string().min(3).required(),
        movieId: Joi.string().min(3).required()
    });
    return schema.validate(rentalName);
};

function setDateOut(now){
    const [y, m, d] = [now.getFullYear(), now.getMonth(), now.getDate()];
    if(m == 11)
        return `${y + 1}/${1}/${d}`;
    else
        return `${y}/${m + 1}/${d}`;    
}

exports.router = router;
exports.rentalSchema = rentalSchema;
exports.Rental = Rental;