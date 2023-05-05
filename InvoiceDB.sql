USE master
GO

-- Drop the database if it already exists
IF  EXISTS (
	SELECT name 
		FROM sys.databases 
		WHERE name = N'InvocieManagementDB'
)
DROP DATABASE InvocieManagementDB
GO
-- Create database
CREATE DATABASE InvocieManagementDB
GO

USE InvocieManagementDB
GO

-- Tạo bảng khách hàng
CREATE TABLE Sellers (
  SellerID INT PRIMARY KEY,
  [SellerName] VARCHAR(50),
  [TaxCode] BIGINT UNIQUE
);

-- Tạo bảng hóa đơn
CREATE TABLE Invoices (
  InvoiceID INT PRIMARY KEY,
  InvoiceDate DATE,
  TaxCode BIGINT,
  SubTotal BIGINT,
  Vat BIGINT,
  Total BIGINT,
  [FileInvoice] VARBINARY(MAX) 
  FOREIGN KEY (TaxCode) REFERENCES Sellers(TaxCode)
);


