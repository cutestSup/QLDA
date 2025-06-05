require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./src/routes");
const sequelize = require("./src/utils/db");

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
