const router = require("express").Router();
const sql = require('mssql')
const config = require("../config/index")
const uploadCloud = require("../middlewares/cloudinary")

const convertDate = (dateString) => {
  const parts = dateString.split('-');
  const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return convertedDate;
}

// Get invoices
router.get("/", async (req, res) => {
  const pool = await sql.connect(config);
  const request = pool.request()

  const result = await request.query`
  SELECT Invoices.*, Sellers.SellerName
  FROM Invoices
  JOIN Sellers ON Invoices.TaxCode  = Sellers.TaxCode`

  sql.close();
  return res.json({
    success: !!result.recordset?.length, 
    data: result.recordset
  })
})

router.post("/", uploadCloud.single("image"), async (req, res) => {
  try {
    const fileInvoice = req.file.path
    const pool = await sql.connect(config);
    const request = pool.request();

    // create table variable
    const table = new sql.Table('TableData');
    table.columns.add('InvoiceNumber', sql.VarChar(100));
    table.columns.add('InvoiceDate', sql.Date);
    table.columns.add('TaxCode', sql.VarChar(100));
    table.columns.add('SellerName', sql.NVarChar(2000));
    table.columns.add('SubTotal', sql.BigInt);
    table.columns.add('Vat', sql.BigInt);
    table.columns.add('Total', sql.BigInt);
    table.columns.add('FileInvoice', sql.VarChar(sql.MAX));

    // insert data from request body into table variable
    const { invoiceNumber, invoiceDate, taxCode, subTotal, vat, total, sellerName } = req.body;
    table.rows.add(invoiceNumber, invoiceDate, taxCode, sellerName, subTotal, vat, total, fileInvoice);

    // pass table variable as parameter to stored procedure
    request.input('Data', table);
    const result = await request.execute('sp_InvoiceInsertTable');
    sql.close();
    return res.json({
      success: true,
      message: "Thêm hoá đơn thành công"
    })
  } catch (error) {
    res.json({
      success: false,
      message: error
    })
  }
})

// Update invocies using procedure
router.put("/:id", uploadCloud.single("image"), async (req, res) => {
  try {
    const fileInvoice = req?.file?.path
    const pool = await sql.connect(config);
    const request = pool.request();
    const invoiceId = req.params.id
    const { invoiceNumber, invoiceDate, taxCode, subTotal, vat, total, backupUrl } = req.body

    request.input('FileInvoice', sql.VarChar(sql.MAX), fileInvoice || backupUrl);
    request.input('InvoiceID', sql.Int, +invoiceId);
    request.input('InvoiceNumber', sql.NVarChar(100), invoiceNumber);
    request.input('InvoiceDate', sql.Date, invoiceDate);
    request.input('TaxCode', sql.VarChar(100), taxCode);
    request.input('SubTotal', sql.Int, +subTotal);
    request.input('Vat', sql.Int, +vat);
    request.input('Total', sql.Int, +total);

    await request.execute('sp_InvoiceUpdate');
    sql.close();
    return res.json({
      success: true,
      message: "Cập nhật hoá đơn thành công"
    })
  } catch (error) {
    console.log('error :>> ', error);
    res.json({
      success: false
    })
  }
})

router.delete("/:id", async (req, res) => {
  const pool = await sql.connect(config);
  const request = pool.request()
  const id = req.params.id

  request.input('id', sql.Int, id)
  const query = "DELETE FROM INVOICES WHERE InvoiceID = @id"
  const result = await request.query(query)

  const { rowsAffected } = result
  sql.close();
  return res.json({
    success: !!rowsAffected[0] === 1, 
    data: rowsAffected
  })
})

module.exports = router