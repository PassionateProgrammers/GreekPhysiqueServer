const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
        required: true
    }
})

//static signup method
userSchema.statics.signup = async function(firstname, lastname, email, password) {

    //validation
    if (!firstname || !lastname || !email || !password) {
        throw Error('All Fields Required')
    }

    if (!validator.isEmail(email)) {
        throw Error('Please enter a valid email address')
    }

    if (!validator.isStrongPassword(password)) {
        throw Error('Password must be a minimum of 8 characters and include at least one of each: uppercase, lowercase, number, symbol')
    }

    const normalizedEmail = email.toLowerCase()
    
    const exists = await this.findOne({ email: normalizedEmail })

    if(exists) {
        throw Error(('Email already in use'))
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ firstname, lastname, email: normalizedEmail, password: hash})

    return user
}

//static login method
userSchema.statics.login = async function(email, password) {
    
    if (!email || !password) {
        throw Error('All Fields Required')
    }

    const user = await this.findOne({ email })

    if(!user) {
        throw Error(('Invalid email'))
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        throw Error('Invalid password')
    }
    return user
}

module.exports = mongoose.model('User', userSchema)