exports.DATABASE_URL = process.env.MONGODB_URI ||
                      'mongodb://localhost/runLog';
exports.PORT = process.env.PORT || 8080;