const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Joi = require('Joi');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const password_checking = require('joi-password-complexity');
const auth = require('../middleware/auth');

const complexityOptions = {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3,
};

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function() {
    /*create a json web token with env-var private key */
    const token = jwt.sign({_id: this.id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User', userSchema);


//GET CURRENT USER 
router.get('/me', auth, async(req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});


//CREATE 
router.post('/', async(req, res) => {
    const { error } = nameValidation(req.body);
    if(error) return res.status(400).send(`Bad requetgdst: ${error.details[0].message} `);
    
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send('User has already registerd!');

    user = new User(_.pick(req.body, ['name', 'email', 'password','isAdmin']));

    /*Hashing the password */
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();    

    res.header('x-auth-token', token)                  /*set jwt as a response header */
        .send(_.pick(user, ['_id', 'email', 'name'])); /*pick some properties and send */
});




//functions
function nameValidation(userName){
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(5).required().email(),
        password: Joi.string().required(),
        isAdmin: Joi.boolean()
    });  
    /*check complexity of password */   
    const passCheck = (password_checking(complexityOptions).validate(userName.password));
    if(passCheck.error) return passCheck
    else return schema.validate(userName);
};

exports.router = router;
exports.userSchema = userSchema;
exports.User = User;