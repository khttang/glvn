/**
 * Created by ktang on 11/3/15.
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
var TeacherSchema = new Schema({
    userId: {
        type: String,
        trim: true,
        unique: 'UserId already exists',
        required: 'Please fill in user id'
    },
    userName: {
        type: String,
        trim: true,
        unique: 'UserName already exists',
        required: 'Please fill in userName'
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

mongoose.model('Teacher', TeacherSchema);
