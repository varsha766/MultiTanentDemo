require("dotenv").config();

const tenantUrl = process.env.DB_URI;
const adminUrl = process.env.DB_URL;

module.exports = {
  tenantUrl: tenantUrl,
  adminUrl: adminUrl,
};
