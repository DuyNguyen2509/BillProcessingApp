const express = require("express");
const routes = express.Router();

const invoiceRoutes = require("./invoices")
const sellerRoutes = require("./sellers")

routes.use("/api/v1/invoices", invoiceRoutes);
routes.use("/api/v1/sellers", sellerRoutes);

module.exports = routes;