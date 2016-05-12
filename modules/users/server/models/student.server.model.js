/**
 * Created by ktang on 10/19/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Student Schema
 */
var StudentSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: 'UserName already exists',
        required: 'Please fill in userName'
    },
    photo: {
        type: String
    },
    hasBaptismCert: {
        type: Boolean,
        default: false
    },
    baptismCert: {
        type: String
    },
    baptismPlace: {
        type: String
    },
    communionDate: {
        type: Date
    },
    communionCert: {
        type: String
    },
    communionPlace: {
        type: String
    },
    confirmedDate: {
        type: Date
    },
    confirmationCert: {
        type: String
    },
    confirmationPlace: {
        type: String
    },
    youthMinistry: [
        {
            role: {
                type: String,
                trim: true
            },
            year: {
                type: Number,
                trim: true
            }
        }
    ],
    updated: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Student', StudentSchema);

