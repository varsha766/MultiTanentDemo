const mongoose = require("mongoose");
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};
//creating connection object
const connectToDatabase = (dbUrl) => {
  return new Promise(async (resolve, reject) => {
    const connection = await mongoose
      .createConnection(dbUrl, mongoOptions)
      .asPromise();
    resolve(connection);
  });
};
module.exports = {
  connectToDatabase,
};
