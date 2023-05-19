const express = require("express")
const cors = require("cors")
const helmet = require("helmet");
const morgan = require("morgan");
require('dotenv').config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(helmet())

const routes = require("./routes/index.js");
app.use(routes);
app.use(morgan("common"));

app.listen(process.env.PORT, () => {
  console.log(`APP IS RUNNING ON PORT: ${process.env.PORT}`);
})