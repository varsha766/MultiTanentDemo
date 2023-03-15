const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

const { getTenantModel } = require("./connections/adminConnection");
const { getUserModel } = require("./connections/tenantConnection");

//api to create tenant

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

//adding data of user to particular tenant DB
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

app.listen(port, () => {
  console.log(`listening ${port}`);
});
