USE master
GO

-- Drop the database if it already exists
IF  EXISTS (
	SELECT name 
		FROM sys.databases 
		WHERE name = N'InvoiceManagementDB'
)
DROP DATABASE InvoiceManagementDB
GO
-- Create database
CREATE DATABASE InvoiceManagementDB
GO

USE InvoiceManagementDB
GO

-- Tạo bảng khách hàng
CREATE TABLE Sellers (
  SellerID INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [SellerName] NVARCHAR(2000),
  [TaxCode] VARCHAR(100) UNIQUE NOT NULL
);

-- Tạo bảng hóa đơn
CREATE TABLE Invoices (
  InvoiceID INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  InvoiceNumber VARCHAR(100),
  InvoiceDate DATE NOT NULL,
  TaxCode VARCHAR(100) NOT NULL,
  SubTotal BIGINT,
  Vat BIGINT,
  Total BIGINT NOT NULL,
  [FileInvoice] VARCHAR(MAX) NOT NULL 
  FOREIGN KEY (TaxCode) REFERENCES Sellers(TaxCode)
);

CREATE TYPE TableData AS TABLE (
  InvoiceNumber VARCHAR(100),
  InvoiceDate DATE,
  TaxCode VARCHAR(100),
  [SellerName] NVARCHAR(2000),
  SubTotal BIGINT,
  Vat BIGINT,
  Total BIGINT,
  [FileInvoice] VARCHAR(MAX) 
);

INSERT INTO Sellers (SellerName,TaxCode) VALUES ('','0')

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
SELECT DISTINCT InvoiceNumber, InvoiceDate, TaxCode, SubTotal, Vat, Total, [FileInvoice] 
FROM @Data D
WHERE NOT EXISTS(
	SELECT 1
	FROM Invoices I
	WHERE I.InvoiceNumber = D.InvoiceNumber AND 
			I.InvoiceDate = D.InvoiceDate AND
			I.TaxCode = D.TaxCode
)
END

CREATE PROCEDURE sp_InvoiceInsert @InvoiceNumber VARCHAR(100), @InvoiceDate DATE, @TaxCode VARCHAR(100), @SubTotal BIGINT, @Vat BIGINT, @Total BIGINT, @FileInvoice VARCHAR(1000) AS
BEGIN
DECLARE @IsHas int = (SELECT COUNT(*) FROM Invoices WHERE InvoiceDate = @InvoiceDate AND TaxCode = @TaxCode AND InvoiceNumber = @InvoiceNumber)
DECLARE @IsHasSeller int = (SELECT COUNT(*) FROM Sellers WHERE TaxCode = @TaxCode)
IF(@IsHas = 0 and @IsHasSeller != 0)
	BEGIN
		INSERT
		Invoices (InvoiceNumber, InvoiceDate, TaxCode, SubTotal, Vat, Total, FileInvoice) 
		VALUES 
		(@InvoiceNumber, @InvoiceDate, @TaxCode, ISNULL(@SubTotal,NULL), ISNULL(@Vat,NULL), @Total, @FileInvoice)
	END
END

ALTER PROCEDURE sp_InvoiceUpdate 
    @InvoiceID INT, 
    @InvoiceNumber VARCHAR(20),
    @InvoiceDate DATE, 
    @TaxCode VARCHAR(20), 
    @SubTotal BIGINT, 
    @Vat BIGINT, 
    @Total BIGINT 
AS
BEGIN
    UPDATE Invoices 
    SET 
        InvoiceNumber = ISNULL(@InvoiceNumber, InvoiceNumber),
        InvoiceDate = ISNULL(@InvoiceDate, InvoiceDate),
        TaxCode = ISNULL(@TaxCode, TaxCode),
        SubTotal = ISNULL(@SubTotal, SubTotal),
        Vat = ISNULL(@Vat, Vat),
        Total = ISNULL(@Total, Total)
    WHERE InvoiceID = @InvoiceID AND (
        @InvoiceNumber IS NOT NULL OR
        @InvoiceDate IS NOT NULL OR
        @TaxCode IS NOT NULL OR
        @SubTotal IS NOT NULL OR
        @Vat IS NOT NULL OR
        @Total IS NOT NULL
    )
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

CREATE PROCEDURE sp_SellerUpdate @SellerID INT, @SellerName NVARCHAR(2000), @TaxCode VARCHAR(100) AS
BEGIN
		DECLARE @IsHas INT = (SELECT COUNT(1) FROM Sellers WHERE TaxCode = @TaxCode)
		DECLARE @InvoiceTaxCode VARCHAR(100) = (SELECT TaxCode FROM Sellers WHERE SellerID = @SellerID)
		IF(@IsHas = 0 OR @InvoiceTaxCode = @TaxCode)
		BEGIN
			UPDATE Invoices SET TaxCode = '0' WHERE TaxCode = @InvoiceTaxCode
			UPDATE Sellers SET SellerName = @SellerName, TaxCode = @TaxCode WHERE SellerID = @SellerID
			UPDATE Invoices SET TaxCode = @TaxCode WHERE TaxCode = '0'
		END
END

CREATE PROCEDURE sp_SellerInsert @SellerName NVARCHAR(2000), @TaxCode VARCHAR(100) AS
BEGIN
	DECLARE @IsHas INT = (SELECT COUNT(1) FROM Sellers WHERE TaxCode = @TaxCode)
	IF(@IsHas = 0)
		INSERT INTO Sellers (SellerName,TaxCode) values (@SellerName, @TaxCode)
END

CREATE PROCEDURE sp_SellerGet @PageIndex INT, @PageSize INT AS
BEGIN
DECLARE @StartRow INT = (@PageIndex - 1) * @PageSize + 1;
DECLARE @EndRow INT = @PageIndex * @PageSize;
SELECT *
FROM(
	SELECT 
		SellerID, 
		SellerName, 
		TaxCode, 
		ROW_NUMBER() OVER (ORDER BY SellerID) AS RowNum
	FROM Sellers WHERE TaxCode != '0'
) AS S
Where S.RowNum >= @StartRow AND S.RowNum <= @EndRow
ORDER BY S.RowNum
END