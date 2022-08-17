const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const customerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: true
    }
});

const Customer = mongoose.model('Customer', customerSchema);


/**API END-POINTS **/

//GET ALL
router.get('/', async(req, res) => {
    const customers = await Customer.find()
        .sort({name: 1});
    res.send(customers);
});

//GET BY ID
router.get('/:id', async(req, res) => {
    const customer = await Customer.findById(req.params.id);
    if(!customer){ return res.status(404).send('ID dose not find')};
    res.send(customer);
});

//CREATE 
router.post('/', auth, async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error){return res.status(400).send(`Bad request: ${error.details[0].message} `);}
    let customer = new Customer({
        name : req.body.name,
        phone : req.body.phone,
        isGold : req.body.isGold
    });
    customer = await customer.save();
    res.send(customer);    
});


//UPDATE 
router.put('/:id', auth, async (req, res) => {
    const { error } = nameValidation(req.body);
    if(error){
        return res.status(400).send(`Bad request: ${error.details[0].message} `);
    }
    const customer = await Customer.findByIdAndUpdate(req.params.id,
        {name: req.body.name}, {new: true});
    if(!customer){ return res.status(404).send('ID dose not find') };
        
    res.send(customer);
});

//DELETE 
router.delete('/:id', [auth, admin], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if(!customer){ return res.status(404).send('ID dose not find') };
    res.send(customer);
});


//functions
function nameValidation(customerName){
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().length(8).required(),
        isGold: Joi.boolean()
    });
    return schema.validate(customerName);
};

exports.router = router;
exports.Customer = Customer;
exports.customerSchema = customerSchema;