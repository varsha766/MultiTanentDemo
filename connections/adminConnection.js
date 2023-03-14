const { connectToDatabase } = require("./db-connection");
const { tenantSchema } = require("../models/tenant");
const { adminUrl } = require("../config");
let db;
const getDb = async () => {
  db = db ? db : await connectToDatabase(adminUrl);
  return db;
};
const getTenantModel = async () => {
  const adminDb = await getDb();
  return adminDb.model("tenants", tenantSchema);
};

module.exports = {
  getTenantModel,
};
