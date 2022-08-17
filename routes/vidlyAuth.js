const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Joi = require('Joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User} = require('./vidlyUsers');



//CREATE 
router.post('/', async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error) return res.status(400).send(`Bad requetgdst: ${error.details[0].message} `);
    
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid email!');

    /*check matching between entered password and DB hashed-password*/
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) res.status(400).send('Invalid password!');

    const token = user.generateAuthToken();
    res.send(token); 
});




//functions

function nameValidation(userName){
    const schema = Joi.object({
        email: Joi.string().min(5).required().email(),
        password: Joi.string().required(),
    });     
    
    return schema.validate(userName);
};

exports.router = router;
