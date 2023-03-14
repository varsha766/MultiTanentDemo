const { connectToDatabase } = require("./db-connection");
const { tenantUrl } = require("../config");

const { UserSchema } = require("../models/user");
let db;

const getTenantDB = async (tenantId) => {
  const dbName = `tenant-${tenantId}`;
  db = db ? db : await connectToDatabase(tenantUrl);
  let tenantDb = db.useDb(dbName, { useCache: true });
  return tenantDb;
};

const getUserModel = async (tenantId) => {
  const tenantDb = await getTenantDB(tenantId);
  return tenantDb.model("user", UserSchema);
};

module.exports = { getUserModel };
