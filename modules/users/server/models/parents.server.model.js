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
 * Parents Schema
 */
var ParentsSchema = new Schema({
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
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Parents', ParentsSchema);
