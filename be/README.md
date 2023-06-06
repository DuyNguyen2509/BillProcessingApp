# invoice-be

### TO ACCESS THIS API
#1. NPM\
#2. NPM INSTALL\
#3. ACCESS TO http://localhost:8001


### API DOCUMENTATION
#1. INVOCIES ENDPOINT: http://localhost:8001/api/v1/invoices

## GET INVOICES
- URL: http://localhost:8001/api/v1/invoices
- METHOD: GET
- BODY: 
  + limit<<"number">> (optional)
  + offset<<"number">> (optional)
  
## CREATE INVOICE
- URL: http://localhost:8001/api/v1/invocies
- METHOD: POST
- BODY:
  + invoiceNumber <<"string">> (require)
  + invoiceDate <<"Date">> (require) #YYYY-MM--DD
  + taxCode <<"string">> (require)
  + subTotal <<"number">> (require)
  + total <<"number">> (require)
  + vat <<"number">> (require)
  + sellerName <<"string">> (require)
  + image <<"File">> (require)

## UPDATE INVOICE
- URL: http://localhost:8001/api/v1/invoices/:id
- METHOD: POST
- BODY: 
  + invoiceNumber <<"string">> (require)
  + invoiceDate <<"Date">> (require) #YYYY-MM--DD
  + taxCode <<"string">> (require)
  + subTotal <<"number">> (require)
  + total <<"number">> (require)
  + vat <<"number">> (require)
  + sellerName <<"string">> (require)
  + image <<"File">> (require)
  + backupUrl <<"string">> (require)



#2. SELLERS ENPOINT: http://localhost:8001/api/v1/sellers
## GET SELLERS
- URL: http://localhost:8001/api/v1/sellers
- METHOD: GET

## CREATE SELLER
- URL: http://localhost:8001/api/v1/sellers
- METHOD: POST
- BODY: 
  + sellerName <<"string">> (require)
  + taxCode <<"string">> (require)

## UPDATE SELLER
- URL: http://localhost:8001/api/v1/sellers/:id
- METHOD: PUT
- BODY: 
  + sellerName <<"string">> (require)
  + taxCode <<"string">> (require)
