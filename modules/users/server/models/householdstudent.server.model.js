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
 * Registration Schema
 */
var HouseholdStudentSchema = new Schema({
    houseHoldId: {
        type: String,
        trim: true,
        required: 'Please fill in household id'
    },
    studentId: {
        type: String,
        trim: true,
        required: 'Please fill in student id'
    }
});

HouseholdStudentSchema.index({houseHoldId: 1, studentId: 1}, {unique: true});

mongoose.model('HouseholdStudent', HouseholdStudentSchema);
