require("dotenv").config();

const tenantUrl = process.env.DB_URI;
const adminDBUrl = process.env.DB_URL;

module.exports = {
  tenantUrl: tenantUrl,
  adminDBUrl: adminDBUrl,
};
