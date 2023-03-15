# MultiTanentDemo
## Introduction

Traditionally, software application were developed and deployed on dedicated hardware or servers, which meant that each customer required their own server, database, and resource. This approach was expensive and time-consuming to scale and maintain, especially for smaller organization or businesses.
The concept of multi-tenancy emerged as a way to address this challenge.

Multi-tenancy is a software architecture in which a single instance of software serves multiple customer, each customer is called **tenant**.They shares the same resource but data is isolated and kept seprate from other tenants.
![multi-tenant app](https://user-images.githubusercontent.com/91577031/225214500-ef2823c9-5d77-41c4-adac-7020406df2b5.png)

 There are several approach to implement multi-tenancy
 
 - Shared Database:- In this approach, all tenants share a single database or schema, with each tenant's data is seprated by a "tenantId" column or field.This approach uses RLS(Row-level-security).
 - Seprate Database:- Each tenant has their own seprate database or schema, with no data sharing between tenants. This approach provides strong data isolation and security.
 - Hybrid approach:- This approach combines  element of both shared and separate infrastructure for each tenant.
 
 I have used Seprate Database approach for implementing multi-tenancy.
 The app (and db) is divided into 2 categories: Tenant and Tenant users(the api routes are segregated as /tenant and /tenant/:tenantId/user).
 **Tenant** is used to manage tenant creation, storing and fetching tenant db connection information, etc.
 **Tenant users** is used to create, store user detail of particular tenant.
 
 
 Following are the main components used
  - `Create connection Object`: Create connection object based on the dbUrl passed.
  ```js
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
    const connection = await mongooseCreate connection to tenant Db whose users details to be stored or fetched

      .createConnection(dbUrl, mongoOptions)
      .asPromise();
    resolve(connection);
  });
};
module.exports = {
  connectToDatabase,
};
```
- `Creating connection to adminDb`: Create a connection to the admin database to store tenant information in the `tenant` table.
 ```js
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
```
- `Creating connection to tenantDB`: Create a connection to the tenant database in order to store or fetch user details.
```js
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
```
- `Admin app api`: Api to create new tenant
```js
app.post("/tenant", async (req, res) => {
  try {
    const { name, email, password, appName } = req.body;
    const tenantModel = await getTenantModel();
    let tenantDetail = await tenantModel.findOne({ name, email });
    if (tenantDetail) {
      return res.status(400).send("Tenant detail already exists");
    }
    tenantDetail = new tenantModel({ name, email, password, appName });
    await tenantDetail.save();
    res.send(tenantDetail);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
```
- `Tenant user api`: Api to create new user in particular tenant
```js
app.post("/tenant/:tenantId/user", async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log(tenantId);
    const { name, email } = req.body;
    const tenatModel = await getTenantModel();
    let tenantDetail = await tenatModel.findOne({ _id: tenantId });
    const appName = tenantDetail.appName;
    if (!tenantDetail) {
      res.status(404).send(`No tenant found with Id ${tenantId}`);
    }
    const userModel = await getUserModel(appName);
    const userDetail = new userModel({ name, tenantId, email });
    await userDetail.save();
    res.send(userDetail);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
```
[Github repo](https://github.com/varsha766/MultiTanentDemo)
