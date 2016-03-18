'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    User = require('mongoose').model('User');

/**
 * Globals
 */
var user1, user2, user3;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function () {

  before(function () {
    user1 = {
      status: 'PROVISIONED',
      userType: 'STUDENT',
      saintName: 'Saint Name',
      firstName: 'Full',
      lastName: 'Name',
      username: 'K01231999T',
      password: 'Passw0rd',
      gender: 'Male',
      birthDate: '01/23/1999',
      address: 'address line1',
      city: 'my city',
      zipCode: '92129'
    };
    // user2 is a clone of user1
    user2 = user1;
    user3 = {
      status: 'PROVISIONED',
      userType: 'STUDENT',
      saintName: 'Saint Name',
      firstName: 'Different',
      lastName: 'User',
      username: 'K01232015T',
      password: 'Passw0rd',
      gender: 'Male',
      birthDate: '01/23/1999',
      address: 'address line1',
      city: 'my city',
      zipCode: '92129'
    };
  });

  describe('Method Save', function () {
    it('should begin with no users', function (done) {
      User.find({}, function (err, users) {
        users.should.have.length(0);
        done();
      });
    });

    it('should be able to save without problems', function (done) {
      var _user1 = new User(user1);

      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should fail to save an existing user again', function (done) {
      var _user1 = new User(user1);
      var _user2 = new User(user2);

      _user1.save(function () {
        _user2.save(function (err) {
          should.exist(err);
          _user1.remove(function (err) {
            should.not.exist(err);
            done();
          });
        });
      });
    });

    it('should fail to save user with invalid user status', function (done) {
      var _user1 = new User(user1);
      _user1.status = 'bogus';

      _user1.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should fail to save user with invalid email status', function (done) {
      var _user1 = new User(user1);
      _user1.emails = [{address:'email1@test.com', status:'bogus'},{address:'email2@test.com'}];
      _user1.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should fail to save user with invalid phone status', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number:'(858)123-4567'},{number:'(858)123-4567', status:'bogus'}];
      _user1.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without first name', function (done) {
      var _user1 = new User(user1);

      _user1.firstName = '';
      _user1.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to find by username and authenticate user', function (done) {
      var _user1 = new User(user1);
      _user1.save(function () {
        User.findOne({
          username: _user1.username
        }, function (err, user) {
          if (err) {
            return done(err);
          }
          var authed = true;
          if (!user || !user.authenticate(user1.password)) {
            authed = false;
          }
          should(authed).be.equal(true);
          _user1.remove(function (err) {
            should.not.exist(err);
            done();
          });
        });
      });
    });

    it('should confirm that saving user model doesnt change the username', function (done) {
      var _user1 = new User(user1);

      _user1.save(function (err) {
        should.not.exist(err);
        var usernameBefore = _user1.username;
        _user1.firstName = 'test';
        _user1.save(function (err) {
          var usernameAfter = _user1.username.toLowerCase();
          usernameBefore.toLowerCase().should.equal(usernameAfter);
          _user1.remove(function (err) {
            should.not.exist(err);
            done();
          });
        });
      });
    });

    it('should be able to save 2 different users', function (done) {
      var _user1 = new User(user1);
      var _user3 = new User(user3);

      _user1.save(function (err) {
        should.not.exist(err);
        _user3.save(function (err) {
          should.not.exist(err);
          _user3.remove(function (err) {
            should.not.exist(err);
            _user1.remove(function (err) {
              should.not.exist(err);
              done();
            });
          });
        });
      });
    });

    it('should be able to save user with multiple emails', function (done) {
      var _user1 = new User(user1);
      _user1.emails = [{address:'email1@test.com', status:'CONFIRMED'},{address:'email2@test.com'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should be able to save user with multiple phones', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number:'(858)123-4567'},{number:'(858)123-4567', status:'BLOCKED'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should not be able to save another user with the same userName', function (done) {
      // Test may take some time to complete due to db operations
      //this.timeout(10000);
      var _user1 = new User(user1);
      var _user3 = new User(user3);

      _user1.save(function (err) {
        should.not.exist(err);
        _user3.username = _user1.username;
        _user3.save(function (err) {
          should.exist(err);
          _user1.remove(function(err) {
            should.not.exist(err);
            done();
          });
        });
      });

    });
  });

  describe('User E-mail Validation Tests', function() {
    it('should not allow invalid email address - "123"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'123'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow invalid email address - "123@123"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'123@123'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow invalid email address - "123.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'123.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow invalid email address - "@123.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'@123.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow invalid email address - "abc@abc@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc@abc@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow invalid characters in email address - "abc~@#$%^&*()ef=@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc~@#$%^&*()ef=@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow space characters in email address - "abc def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc def@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow doudble quote characters in email address - "abc\"def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc\"def@abc.com'}];
      _user1.save(function (err) {
        if (err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should not allow double dotted characters in email address - "abcdef@abc..com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abcdef@abc..com'}];
      _user1.save(function (err) {
        if (err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });

    });

    it('should allow single quote characters in email address - "abc\'def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc\'def@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.not.exist(err);
          done();
        }
      });
    });

    it('should allow valid email address - "abc@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.not.exist(err);
          done();
        }
      });

    });

    it('should allow valid email address - "abc+def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc+def@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.not.exist(err);
          done();
        }
      });

    });

    it('should allow valid email address - "abc.def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc.def@abc.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.not.exist(err);
          done();
        }
      });

    });

    it('should allow valid email address - "abc.def@abc.def.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc.def@abc.def.com'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.not.exist(err);
          done();
        }
      });

    });

    it('should allow valid email address - "abc-def@abc.com"', function (done) {
      var _user1 = new User(user1);

      _user1.emails = [{address:'abc-def@abc.com'}];
      _user1.save(function (err) {
        should.not.exist(err);
        if (!err) {
          _user1.remove(function (err_remove) {
            should.not.exist(err_remove);
            done();
          });
        } else {
          done();
        }
      });

    });
  });

  describe('User Phone Validation Tests', function() {
    it('should not allow invalid phone number - "123"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });

    it('should not allow invalid phone number - "123456789"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123456789'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });
    it('should not allow invalid phone number - "123--4567890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123--4567890'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });

    it('should not allow invalid phone number - "123)-456789"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123)-456789'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });

    it('should not allow invalid phone number - "123..4567890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123..4567890'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });

    it('should not allow invalid phone number - "123)(4567890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123)(4567890'}];
      _user1.save(function (err) {
        if (!err) {
          _user1.remove(function (err_remove) {
            should.exist(err);
            should.not.exist(err_remove);
            done();
          });
        } else {
          should.exist(err);
          done();
        }
      });
    });

    it('should allow valid phone number - "123.456.7890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123.456.7890'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should allow valid phone number - "123-456-7890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123.456.7890'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should allow valid phone number - "(123)456-7890"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123.456.7890'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    it('should allow valid phone number - "(123) 456-7890 5000"', function (done) {
      var _user1 = new User(user1);
      _user1.phones = [{number: '123.456.7890'}];
      _user1.save(function (err) {
        should.not.exist(err);
        _user1.remove(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });
  });

  after(function (done) {
    User.remove().exec(done);
  });
});
