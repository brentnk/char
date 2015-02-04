var m = require('mongoose');
var bcrypt = require('bcrypt');
SALT_FACTOR = 10;
MAX_LOGIN_ATTEMPTS = 5
LOCK_TIME = 2 * 60 * 60 * 1000;

var userSchema = m.Schema({
    username: {type:String, required:true, index: {unique: true}},
    password: {type:String, required:true},
    loginAttempts: {type:Number, required:true, default: 0},
    lockUntil: Number,
    roles: [String]
});

var reasonn = userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

userSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        });
    });
});

userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.comparePassword = function(candidate, callback) {
    bcrypt.compare(candidate, this.password, function(err, isMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

userSchema.methods.incLoginAttempts = function(callback) {
    if (this.lockUntil && this.lockUntil > Date.now()) {
        return this.update({
            $set: { loginAttempts: 1},
            $unset: { lockUntil: 1}
        }, callback);
    }

    var updates = { $inc: { loginAttempts: 1}};

    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }

    return this.update(updates, callback);
};

userSchema.statics.getAuthenticated = function(username, password, callback) {
    this.findOne({username:username}, function(err, user) {
        if (err) {
            return err;
        }

        if (!user) {
            return callback(null, false, reasons.NOT_FOUND);
        }

        if (user.isLocked) {
            return user.incLoginAttempts(function(err) {
                if (err) {
                    return callback(err);
                }
                return callback(null, false, reasons.MAX_ATTEMPTS);
            });
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err)  {
                return callback(err);
            }

            if (isMatch) {
                if (!user.loginAttempts && !user.lockUntil){
                    return callback(null, user);
                }

                var updates = {
                    $set: {loginAttempts: 0},
                    $unset: {lockUntil: 0}
                };

                return user.update(updates, function(err) {
                    if (err) {
                        return callback(err);
                    };
                    return callback(null, user);
                });
            };
        });
    });
};

exports = module.exports = m.model('user', userSchema);
