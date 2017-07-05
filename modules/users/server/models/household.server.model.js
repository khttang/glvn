/**
 * Created by ktang on 4/9/17.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
    //var re = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    //return ((this.provider !== 'local' && !this.updated) && validator.isEmail(email));
    return true;
};

/**
 * A Validation function for local strategy phone
 */
var validateLocalStrategyPhone = function (phone) {
    var re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return ((this.provider !== 'local' && !this.updated) && (phone.length >= 10) && re.test(phone));
};

var validateStatus = function (searchStr) {
    var statusArray = ['UNCONFIRMED', 'INVALID', 'CONFIRMED', 'BLOCKED'];
    return (statusArray.indexOf(searchStr) > -1);
};

/**
 * Registration Schema
 */
var HouseholdSchema = new Schema({
    fatherFirstName: {
        type: String,
        trim: true,
        default: ''
    },
    fatherLastName: {
        type: String,
        trim: true,
        default: ''
    },
    motherFirstName: {
        type: String,
        trim: true,
        default: ''
    },
    motherLastName: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    zipCode: {
        type: String
    },
    emails: [
        {
            address: {
                type: String,
                lowercase: true,
                trim: true,
                default: '',
                validate: [validateLocalStrategyEmail, 'Please provide a valid email address']
            },
            owner: {
                type: String,
                trim: true,
                default: ''
            },
            status: {
                type: String,   // UNCONFIRMED, INVALID, CONFIRMED, BLOCKED
                trim: true,
                default: 'UNCONFIRMED',
                validate: [validateStatus, 'Status must be in [UNCONFIRMED, INVALID, CONFIRMED, BLOCKED]']
            }
        }
    ],
    phones: [
        {
            number: {
                type: String,
                lowercase: true,
                trim: true,
                default: '',
                validate: [validateLocalStrategyPhone, 'Please provide a valid phone number']
            },
            owner: {
                type: String,
                trim: true,
                default: ''
            },
            type: {
                type: String,
                trim: true,
                default: ''
            },
            status: {
                type: String,   // UNCONFIRMED, INVALID, CONFIRMED, BLOCKED
                trim: true,
                default: 'UNCONFIRMED',
                validate: [validateStatus, 'Status must be in [UNCONFIRMED, INVALID, CONFIRMED, BLOCKED]']
            }
        }
    ],
});

mongoose.model('Household', HouseholdSchema);
