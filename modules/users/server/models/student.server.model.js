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
    hasBaptismCert: {
        type: Boolean,
        default: false
    },
    baptismCert: {
        data: Buffer,
        contentType: String
    },
    communionDate: {
        type: Date
    },
    communionCert: {
        data: Buffer,
        contentType: String
    },
    confirmedDate: {
        type: Date
    },
    confirmationCert: {
        data: Buffer,
        contentType: String
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

