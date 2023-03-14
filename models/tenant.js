const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    appName: {
      type: String,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);

const Tenant = mongoose.model("tenant", tenantSchema);
module.exports = { Tenant, tenantSchema };
