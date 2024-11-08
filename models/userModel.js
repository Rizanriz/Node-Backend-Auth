const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: Number,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiration: Date,
  role: {
    type: String,
    enum: ['user', 'franchisee', 'dealer', 'service provider', 'admin'],
    default: 'user',
  },
});

// Middleware to remove expired verification tokens
userSchema.pre('save', function(next) {
  if (this.verificationTokenExpiration && this.verificationTokenExpiration < new Date()) {
    this.verificationToken = null;
    this.verificationTokenExpiration = null;
  }
  next();
});

module.exports = mongoose.model("Customer", userSchema);