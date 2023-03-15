# Multi-tenant App with Node.js and mongoDb

Traditionally, software applications were developed and deployed on dedicated hardware or servers, which meant that each customer required their own server, database, and resource. This approach was expensive and time-consuming to scale and maintain, especially for smaller organizations or businesses. The concept of multi-tenancy emerged as a way to address this challenge.

Multi-tenancy is a software architecture in which a single instance of software serves multiple customer, each customer is called **tenant**.They shares the same resource but data is isolated and kept separate from other tenants.
![multi-tenant app](https://user-images.githubusercontent.com/91577031/225214500-ef2823c9-5d77-41c4-adac-7020406df2b5.png)

There are several approaches to implementing multi-tenancy

- Shared Database:- In this approach, all tenants share a single database or schema, with each tenant's data separated by a "tenantId" column or field. This approach uses RLS(Row-level-security).
- Separate Database:- Each tenant has their own separate database or schema, with no data sharing between tenants. This approach provides strong data isolation and security.
- Hybrid approach:- This approach combines elements of both shared and separate infrastructure for each tenant.

I have used the Separate Database approach for implementing multi-tenancy. The app (and db) is divided into 2 categories: Tenant and Tenant users(the API routes are segregated as /tenant and /tenant/:tenantId/user).

- **Tenant** is responsible for managing tenant creation, storing and retrieving tenant database connection information, and other related tasks..

- **Tenant users** are responsible for creating and storing user details for their respective tenants.

Following are the main components used

- **Schema for user and tenant**: Define `tenant.js` and `user.js` in a model folder.Tenant will represent the customer that use the application. Each tenant will have a database where userSchema used to store user information.
    ```js
    // tenant.js
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

    ```

    ```js
    //user.js
    const mongoose = require("mongoose");
    const Schema = mongoose.Schema;
    const UserSchema = new Schema(
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        tenantId: {
          type: String,
          required: true,
        },
      },
      {
        timestamp: true,
      }
    );

    const User = mongoose.model("user", UserSchema);
    module.exports = { User, UserSchema };

    ```

- **Create connection Object**: In a multi-tenant approach, it's necessary to establish multiple database connections. One connection is required for the adminDb, and a separate connection is required for each tenant's database. To create these connections, we can pass the corresponding database URLs to a function that creates and returns the connection objects. `connectToDatabase()` function creates a new database connection object.

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
      const connection = await mongoose
        .createConnection(dbUrl, mongoOptions)
        .asPromise();
      resolve(connection);
    });
    };
    module.exports = {
    connectToDatabase,
    };
    ```
  `mongoOptions` are used to configure the MongoDB driver's behavior when connecting MongoDB databse.

- **Creating connection to adminDb**: Create a connection to the admin database to store tenant information in the `tenant` table.

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
    `getDb()` function call connectToDatabase() with adminDBUrl to establish connection with adminDb. 
    `getTenantModel()` allow us to get the registered model for our db.

- **Creating connection to tenantDB**: Create a connection to the tenant database in order to store or fetch user details.

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
    `getUserModel()` function  used to retrieve `User` model for specific tenant. `getTenantDB()` function generate database name with tenantId and return the connection   if already exists.Otherwise esablishes a new connection with `tenantUrl` using `useDb`.
The `{useCache: true}` option passed to the `useDb` method ensures that the database connection is cached for future use.
- **Admin app api**: Sample apis for creating new tenants.
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

- **Tenant user api**: Sample apis for creating new users for particular tenant.

    ```js
    app.post("/tenant/:tenantId/user", async (req, res) => {
      try {
        const { tenantId } = req.params;
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

You can try out the code [here](https://github.com/varsha766/MultiTanentDemo).

## Referrences
- https://www.ibm.com/topics/multi-tenant
- https://www.youtube.com/watch?v=joz0DoSQDNw
- https://medium.com/geekculture/building-a-multi-tenant-app-with-nodejs-mongodb-ec9b5be6e737
