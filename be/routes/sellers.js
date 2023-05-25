const router = require("express").Router();
const sql = require('mssql')
const config = require("../config/index")

router.get("/", async (req, res) => {
  const pool = await sql.connect(config);
  const request = pool.request()

  const result = await request.query`SELECT * FROM SELLERS`

  sql.close();
  return res.json({
    success: !!result.recordset?.length, 
    data: result.recordset
  })
})

router.get("/taxcode", async (req, res) => {
  const pool = await sql.connect(config);
  const request = pool.request()

  const result = await request.query`SELECT DISTINCT TaxCode FROM Sellers WHERE TaxCode <> '0'`

  sql.close();
  return res.json({
    success: !!result.recordset?.length, 
    data: result.recordset
  })
})

// Create sellers
router.post("/", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request()
    const { sellerName, taxCode } = req.body 

    request.input('CustomerID', sql.Int, 1);
    request.input('SellerName', sql.NVarChar(2000), sellerName);
    request.input('TaxCode', sql.NVarChar(20), taxCode);
  
    const result = await request.query`INSERT INTO SELLERS(SellerName, TaxCode) VALUES(@SellerName, @TaxCode)`
    const { rowsAffected } = result

    sql.close();
    return res.json({
      success: rowsAffected[0] === 1, 
      data: result.recordset
    })
  } catch (error) {
    
    return res.json({
      success: false, 
      err: error
    })
  }
})

// Update sellers
router.put("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const id = req.params.id
    const { sellerName, taxCode } = req.body 

    request.input('SellerID', sql.Int, +id);
    request.input('SellerName', sql.NVarChar(2000), sellerName);
    request.input('TaxCode', sql.VarChar(100), taxCode);

    const result = await request.execute('sp_SellerUpdate');
    const { rowsAffected } = result

    sql.close();
    return res.json({
      success: rowsAffected[0] === 1,
      data: rowsAffected
    })
  } catch(err) {
    return res.json({
      success: false,
      message: err
    })
  }
})

router.delete("/:id", async (req, res) => {
  const pool = await sql.connect(config);
  const request = pool.request()
  const id = req.params.id

  request.input('id', sql.Int, id)
  const query = "DELETE FROM SELLERS WHERE SellerID = @id"
  const result = await request.query(query)

  const { rowsAffected } = result
  sql.close();
  return res.json({
    success: !!rowsAffected[0] === 1, 
    data: rowsAffected
  })
})

module.exports = router