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
  SellerID INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [SellerName] NVARCHAR(1000),
  [TaxCode] VARCHAR(20) UNIQUE NOT NULL
);

-- Tạo bảng hóa đơn
CREATE TABLE Invoices (
  InvoiceID INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  InvoiceNumber VARCHAR(20),
  InvoiceDate DATE NOT NULL,
  TaxCode VARCHAR(20) NOT NULL,
  SubTotal BIGINT,
  Vat BIGINT,
  Total BIGINT NOT NULL,
  [FileInvoice] VARBINARY(MAX) NOT NULL 
  FOREIGN KEY (TaxCode) REFERENCES Sellers(TaxCode)
);

CREATE TYPE TableData AS TABLE (
  InvoiceNumber VARCHAR(20),
  InvoiceDate DATE,
  TaxCode VARCHAR(20),
  [SellerName] NVARCHAR(1000),
  SubTotal BIGINT,
  Vat BIGINT,
  Total BIGINT,
  [FileInvoice] VARCHAR(MAX) 
);

CREATE PROCEDURE sp_InvoiceInsertTable @Data TableData READONLY AS
BEGIN
INSERT INTO Sellers (SellerName,TaxCode)
SELECT DISTINCT D.SellerName, D.TaxCode
FROM @Data D
WHERE NOT EXISTS (
        SELECT 1
        FROM Sellers S
        WHERE S.TaxCode = D.TaxCode
    )
INSERT INTO Invoices (InvoiceNumber, InvoiceDate, TaxCode, SubTotal, Vat, Total, [FileInvoice])
SELECT DISTINCT InvoiceNumber, InvoiceDate, TaxCode, SubTotal, Vat, Total, CONVERT(VARBINARY(MAX), [FileInvoice]) 
FROM @Data D
WHERE NOT EXISTS(
	SELECT 1
	FROM Invoices I
	WHERE I.InvoiceNumber = D.InvoiceNumber AND 
			I.InvoiceDate = D.InvoiceDate AND
			I.TaxCode = D.TaxCode
)
END

CREATE PROCEDURE sp_InvoiceInsert @InvoiceNumber BIGINT, @InvoiceDate DATE, @SellerName NVARCHAR(1000), @TaxCode BIGINT, @SubTotal BIGINT, @Vat BIGINT, @Total BIGINT, @FileInvoice VARBINARY(MAX) AS
BEGIN
DECLARE @IsHas int = (SELECT COUNT(*) FROM Invoices WHERE InvoiceDate = @InvoiceDate AND TaxCode = @TaxCode AND InvoiceNumber = @InvoiceNumber)
DECLARE @IsHasSeller int = (SELECT COUNT(*) FROM Sellers WHERE TaxCode = @TaxCode)
IF(@IsHas = 0) 
BEGIN
IF(@IsHasSeller = 0) 
INSERT Sellers (SellerName, TaxCode) VALUES (ISNULL(@SellerName,NULL), @TaxCode)
INSERT Invoices (InvoiceNumber, InvoiceDate, TaxCode, SubTotal, Vat, Total, FileInvoice) 
VALUES 
(@InvoiceNumber, @InvoiceDate, @TaxCode, ISNULL(@SubTotal,NULL), ISNULL(@Vat,NULL), @Total, @FileInvoice)
END
END

CREATE PROCEDURE sp_InvoiceUpdate @InvoiceID INT, @InvoiceNumber BIGINT,@InvoiceDate DATE, @TaxCode BIGINT, @SubTotal BIGINT, @Vat BIGINT, @Total BIGINT, @FileInvoice VARBINARY(MAX) AS
BEGIN
UPDATE Invoices 
SET 
	InvoiceNumber = ISNULL(@InvoiceNumber,InvoiceNumber)
	,InvoiceDate = ISNULL(@InvoiceDate,InvoiceDate)
	,TaxCode = ISNULL(@TaxCode,TaxCode)
	,SubTotal = ISNULL(@SubTotal,SubTotal)
	,Vat = ISNULL(@Vat,Vat)
	,Total = ISNULL(@Total,Total)
	,FileInvoice = ISNULL(@FileInvoice,FileInvoice)
WHERE InvoiceID = @InvoiceID
END

CREATE PROCEDURE sp_SellerUpdate @SellerID INT, @SellerName NVARCHAR(1000) AS
BEGIN
UPDATE Sellers SET SellerName = @SellerName WHERE SellerID = @SellerID
END

CREATE PROCEDURE sp_InvoiceGet @PageIndex INT, @PageSize INT AS
BEGIN
DECLARE @StartRow INT = (@PageIndex - 1) * @PageSize + 1;
DECLARE @EndRow INT = @PageIndex * @PageSize;
SELECT *
FROM(
	SELECT 
		InvoiceID, 
		InvoiceNumber, 
		InvoiceDate, 
		SellerName, 
		Invoices.TaxCode, 
		SubTotal, 
		Vat, 
		Total, 
		ROW_NUMBER() OVER (ORDER BY InvoiceID) AS RowNum
	FROM Invoices JOIN Sellers ON Invoices.TaxCode = Sellers.TaxCode
) AS S
Where S.RowNum >= @StartRow AND S.RowNum <= @EndRow
ORDER BY S.RowNum
END

