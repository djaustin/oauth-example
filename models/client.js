const mongoose = require('mongoose');

// NOTE: Client secret should be HASHED for security
const ClientSchema = new mongoose.Schema({
  // Name of the application accessing the API
  name: {
    type: String,
    unique: true,
    required: true
  },
  // NOTE: ID and Secret are used in the OAuth flow. These should probably be randomly generated
  id: {
    type: String,
    unique: true,
    required: true
  },
  secret: {
    type: String,
    required: true,
  },
  // Identifies the user that owns this application client
  userId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Client', ClientSchema);
