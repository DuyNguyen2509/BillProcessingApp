import './home.scss';
import { Table, Button, Slider, Input, Modal, notification, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { httpGet, httpUpload, httpPut } from '../../services';
import ExcelJS from 'exceljs';
import { EditOutlined } from '@ant-design/icons';

const { Search } = Input;
const marks = {
  0: '0',
  1000000: '1000000'
};

const Home = () => {
  const [invoicesList, setInvoicesList] = useState([]);
  const [totalInvocieValue, setTotalInvocieValue] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState();
  const [openUpsertInvocieModal, setOpenUpsertInvocieModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [image, setImage] = useState();
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [invoiceDate, setInvocieDate] = useState();
  const [taxCode, setTaxCode] = useState();
  const [subTotal, setSubTotal] = useState();
  const [total, setTotal] = useState();
  const [sellerName, setSellerName] = useState();
  const [vat, setVat] = useState();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await httpGet('/invoices');

    setInvoicesList(data || []);
  };
  const columns = [
    {
      title: 'Mã hoá đơn',
      dataIndex: 'InvoiceID',
      key: 'InvoiceID'
    },
    {
      title: 'Tên đối tác',
      dataIndex: 'SellerName',
      key: 'SellerName'
    },
    {
      title: 'Số hoá đơn',
      dataIndex: 'InvoiceNumber',
      key: 'InvoiceNumber'
    },
    {
      title: 'Ngày hoá đơn',
      dataIndex: 'InvoiceDate',
      key: 'InvoiceDate',
      render: date => <span style={{ width: 180, display: 'block' }}>{date.split('T')[0]}</span>
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'TaxCode',
      key: 'TaxCode'
    },
    {
      title: 'Tổng hàng hoá',
      dataIndex: 'SubTotal',
      key: 'SubTotal'
    },
    {
      title: 'Thuế',
      dataIndex: 'Vat',
      key: 'Vat'
    },
    {
      title: 'Tổng hoá đơn',
      dataIndex: 'Total',
      key: 'Total'
    },
    {
      title: 'Ảnh hoá đơn',
      dataIndex: 'FileInvoice',
      key: 'FileInvoice',
      render: fileInvoice => {
        return fileInvoice ? (
          <img
            onClick={() => setSelectedUrl(fileInvoice)}
            src={fileInvoice}
            className="invoices__img"
            alt="File invocies"
          />
        ) : (
          <span>No file here</span>
        );
      }
    },
    {
      title: 'Hành động',
      fixed: 'right',
      render: (_, item) => {
        return (
          <div className="sellers__row-action">
            <div className="action manipulated__action">
              <div className="action__edit">
                <Tooltip title="Sửa">
                  <EditOutlined
                    onClick={() => {
                      setSelectedInvoiceId(item.InvoiceID);
                      setOpenUpsertInvocieModal(true);
                      fillUpData(item);
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        );
      }
    }
  ];

  const handleCreateExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = [
      { header: 'Mã hoá đơn', key: 'InvoiceID', width: 20 },
      { header: 'Thông số hoá đơn', key: 'InvoiceNumber', width: 20 },
      { header: 'Ngày hoá đơn', key: 'InvoiceDate', width: 20 },
      { header: 'Mã số thuế', key: 'TaxCode', width: 20 },
      { header: 'Tổng hàng hoá', key: 'SubTotal', width: 20 },
      { header: 'Thuế', key: 'Vat', width: 20 },
      { header: 'Tổng hoá đơn', key: 'Total', width: 20 }
    ];

    invoicesList.forEach(item => {
      const row = worksheet.addRow(item);
      row.commit();
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hoadon.xlsx';
      link.click();
    });
  };

  const produceDataSource = () => {
    if (totalInvocieValue && !searchValue) return invoicesList.filter(iL => iL.Total <= totalInvocieValue);
    if (searchValue)
      return invoicesList.filter(
        item =>
          item.InvoiceNumber?.indexOf(searchValue) >= 0 ||
          item.Vat?.indexOf(searchValue) >= 0 ||
          item.Total?.indexOf(searchValue) >= 0 ||
          item.SellerName?.indexOf(searchValue) >= 0 ||
          item.SubTotal?.indexOf(searchValue) >= 0
      );

    return invoicesList;
  };

  const onSearch = value => {
    setSearchValue(value);
  };

  const fillUpData = currentInvocie => {
    setInvoiceNumber(currentInvocie.InvoiceNumber);
    setInvocieDate(currentInvocie.InvoiceDate);
    setTaxCode(currentInvocie.TaxCode);
    setTotal(currentInvocie.Total);
    setSubTotal(currentInvocie.SubTotal);
    setVat(currentInvocie.Vat);
    setSellerName(currentInvocie.SellerName);
  };

  const refreshState = () => {
    setInvoiceNumber();
    setInvocieDate();
    setTaxCode();
    setTotal();
    setSubTotal();
    setVat();
    setSellerName();
  };

  const handleAddInvocie = async () => {
    if (!sellerName || !taxCode || !invoiceNumber || !invoiceDate || !total || !subTotal || !vat || !image) {
      notification.error({
        title: 'Thất bại',
        message: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }
    const data = await httpUpload(`/invoices`, {
      sellerName,
      taxCode,
      invoiceNumber,
      invoiceDate,
      total,
      vat,
      subTotal,
      image
    });

    const { success } = data;
    if (success) {
      notification.success({
        title: 'Thành công',
        message: 'Sửa thành công'
      });
      fetchInvoices();
    }
    refreshState();
    setOpenUpsertInvocieModal(false);
  };

  const handleUpdateInvocie = async id => {
    const data = await httpPut(`/invoices/${id}`, {
      sellerName,
      taxCode,
      invoiceNumber,
      invoiceDate,
      total,
      vat,
      subTotal
    });

    const { success } = data;
    if (success) {
      notification.success({
        title: 'Thành công',
        message: 'Thêm đơn thành công'
      });
      fetchInvoices();
    }
    setOpenUpsertInvocieModal(false);
  };

  const handleFileChange = e => {
    setImage(e.target.files);
  };

  return (
    <div className="home__container">
      <div className="home__actions">
        <div className="filter__sections">
          <div className="filter__sections-text">Lọc theo tổng hoá đơn</div>
          <Slider
            min={0}
            max={1000000}
            tooltip={{
              open: true
            }}
            step={100}
            defaultValue={0}
            disabled={false}
            marks={marks}
            value={totalInvocieValue}
            onChange={value => setTotalInvocieValue(value)}
          />

          <div className="filter__sections-text">Tìm kiếm</div>
          <Search placeholder="Nhập từ khoá để tìm kiếm" allowClear onSearch={onSearch} />
        </div>
        <div className="buttons__action">
          <Button onClick={() => setOpenUpsertInvocieModal(true)}>Thêm hoá đơn</Button>
          <Button onClick={handleCreateExcel} type="primary">
            Xuất excel
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={produceDataSource()}
        rowKey={record => record.InvoiceNumber}
        scroll={{ y: 'calc(100vh - 320px)' }}
      />

      <Modal
        title={selectedInvoiceId ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}
        open={openUpsertInvocieModal}
        onOk={() => {
          selectedInvoiceId ? handleUpdateInvocie(selectedInvoiceId) : handleAddInvocie();
        }}
        wrapClassName="add__seller-modal"
        onCancel={() => {
          setOpenUpsertInvocieModal(false);
          setSelectedInvoiceId();
          refreshState();
        }}
        okText={selectedInvoiceId ? 'Sửa' : 'Thêm'}
        cancelText="Huỷ"
      >
        <div className="add__invocie-label">Số hoá đơn:</div>
        <Input
          placeholder="Vui lòng nhập số hoá đơn"
          value={invoiceNumber}
          onChange={e => setInvoiceNumber(e.target.value)}
        />
        {!selectedInvoiceId && (
          <>
            <div className="add__invocie-label">Tên đối tác:</div>
            <Input
              placeholder="Vui lòng nhập tên đối tác"
              value={sellerName}
              onChange={e => setSellerName(e.target.value)}
            />
          </>
        )}
        <div className="add__invocie-label">Ngày hoá đơn:</div>
        <Input
          placeholder="Vui lòng nhập ngày hoá đơn"
          value={invoiceDate}
          onChange={e => setInvocieDate(e.target.value)}
        />
        {!selectedInvoiceId && (
          <>
            <div className="add__invocie-label">Mã số thuế:</div>
            <Input placeholder="Vui lòng nhập mã số thuế" value={taxCode} onChange={e => setTaxCode(e.target.value)} />
          </>
        )}
        <div className="add__invocie-label">Tổng hàng hoá:</div>
        <Input placeholder="Vui lòng nhập tổng hàng hoá" value={subTotal} onChange={e => setSubTotal(e.target.value)} />
        <div className="add__invocie-label">Thuế:</div>
        <Input placeholder="Vui lòng nhập thuế" value={vat} onChange={e => setVat(e.target.value)} />
        <div className="add__invocie-label">Tổng hoá đơn:</div>
        <Input placeholder="Vui lòng nhập tổng hoá đơn" value={total} onChange={e => setTotal(e.target.value)} />
        {!selectedInvoiceId && (
          <>
            <div className="add__invocie-label">Ảnh hoá đơn:</div>
            <input type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
          </>
        )}
      </Modal>

      <Modal open={!!selectedUrl} onCancel={() => setSelectedUrl('')} footer={null}>
        <img src={selectedUrl} alt="" className="popup__image" />
      </Modal>
    </div>
  );
};

export default Home;
