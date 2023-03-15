const { connectToDatabase } = require("./db-connection");
const { tenantSchema } = require("../models/tenant");
const { adminDBUrl } = require("../config");
let db;
const getDb = async () => {
  db = db ? db : await connectToDatabase(adminDBUrl);
  return db;
};
const getTenantModel = async () => {
  const adminDb = await getDb();
  return adminDb.model("tenants", tenantSchema);
};

module.exports = {
  getTenantModel,
};
