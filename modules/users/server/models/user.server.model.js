'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
  return (this.provider !== 'local' || validator.isLength(password, 6));
};

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

var validateUserStatus = function (searchStr) {
  var userStatusArray = ['PROVISIONED', 'IMPORTED', 'ACTIVE', 'INACTIVE'];
  return (userStatusArray.indexOf(searchStr) > -1);
};

var validateUserType = function (searchStr) {
  var userTypeArray = ['STUDENT', 'PARENT', 'TEACHER'];
  return (userTypeArray.indexOf(searchStr) > -1);
};

var validateRole = function (searchStr) {
  var roleArray = ['ADMIN', 'ADMIN-a', 'ADMIN-n', 'ADMIN-l', 'PARENT', 'TEACHER', 'STUDENT', 'GUEST'];  // -a super, -n normal, -l low
  return (roleArray.indexOf(searchStr) > -1);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  userType: {
    type: String,
    required: 'Please fill in user type',
    validate: [validateUserType, 'User type must be in [STUDENT, PARENT, TEACHER]']
  },
  canLogin: {
    type: Boolean,
    required: 'Please specify flag canLogin',
    default: false
  },
  roles: [
    {
      type: String,
      validate: [validateRole, 'User role must be in [ADMIN, PARENT, TEACHER, STUDENT, GUESS]']
    }
  ],
  status: {
    type: String,
    required: 'Please specify a status',
    default: 'ACTIVE',
    validate: [validateUserStatus, 'User status must be in [PROVISIONED, IMPORTED, ACTIVE, INACTIVE]']
  },
  saintName: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Please fill in a username',
    trim: true
  },
  salt: {
    type: String
  },
  password: {
    type: String,
    required: 'Please fill in password',
    validate: [validateLocalStrategyPassword, 'Password should be longer']
  },
  gender: {
    type: String
  },
  birthDate: {
    type: Date
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
  picture: {
    data: Buffer,
    contentType: String
  },
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

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password') && this.password.length >= 6) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  var _this = this;
  var possibleUsername = username.toLowerCase() + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

mongoose.model('User', UserSchema);
