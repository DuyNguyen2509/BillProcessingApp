import './serllers.scss';
import { Table, Tooltip, Modal, notification, Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { httpGet, httpPut, httpPost } from '../../services';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';

const { Search } = Input;

const Sellers = () => {
  const [sellersList, setSellersList] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState();
  const [openUpsertSellerModal, setOpenUpsertSellerModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sellerName, setSellerName] = useState();
  const [taxCode, setTaxCode] = useState();
  useEffect(() => {
    fetchSellers();
  }, []);

  const fillUpData = selectedSeller => {
    setSellerName(selectedSeller.SellerName);
    setTaxCode(selectedSeller.TaxCode);
  };

  const fetchSellers = async () => {
    const { data } = await httpGet('/sellers');

    setSellersList(data || []);
  };

  const columns = [
    {
      title: 'Mã đơn vị đối tác',
      dataIndex: 'SellerID',
      key: 'SellerID'
    },
    {
      title: 'Tên đơn vị đối tác',
      dataIndex: 'SellerName',
      key: 'SellerName'
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'TaxCode',
      key: 'TaxCode'
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
                      setSelectedSellerId(item.SellerID);
                      setOpenUpsertSellerModal(true);
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

  const handleUpdateSeller = async id => {
    if (!id) {
      setOpenUpsertSellerModal(false);
      return;
    }

    const data = await httpPut(`/sellers/${id}`, { sellerName, taxCode });
    const { success } = data;
    if (success) {
      notification.success({
        title: 'Thành công',
        message: 'Cập nhật đơn vị đối tác thành công'
      });
      fetchSellers();
    }
    setOpenUpsertSellerModal(false);
  };

  const onSearch = value => {
    setSearchValue(value);
  };

  const produceDataSource = () => {
    if (searchValue) {
      return sellersList.filter(item => item.SellerName?.indexOf(searchValue) >= 0);
    }

    return sellersList;
  };

  const handleAddSeller = async () => {
    const data = await httpPost(`/sellers`, { sellerName, taxCode });
    const { success } = data;
    if (success) {
      notification.success({
        title: 'Thành công',
        message: 'Thêm đơn vị đối tác thành công'
      });
      fetchSellers();
    } else {
      notification.error({
        title: 'Thất bại',
        message: 'Thêm đơn vị đối tác Thất bại'
      });
    }
    setOpenUpsertSellerModal(false);
  };

  const handleCreateExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = [
      { header: 'Mã đối tác', key: 'SellerID', width: 20 },
      { header: 'Tên đối tác', key: 'SellerName', width: 20 },
      { header: 'Mã số thuế', key: 'TaxCode', width: 20 }
    ];

    sellersList.forEach(item => {
      const row = worksheet.addRow(item);
      row.commit();
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'doitac.xlsx';
      link.click();
    });
  };

  const refreshData = () => {
    setSellerName();
    setTaxCode();
  };

  return (
    <div className="sellers__container">
      <div className="sellers__add-btn">
        <Search placeholder="Nhập từ khoá để tìm kiếm" style={{ maxWidth: 300 }} allowClear onSearch={onSearch} />
        <Button onClick={handleCreateExcel}>Tải excel</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenUpsertSellerModal(true)}>
          Thêm đơn vị đối tác
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={produceDataSource().filter(sl => sl.TaxCode !== '0')}
        rowKey={item => item.SellerID}
        scroll={{ y: 'calc(100vh - 200px)' }}
      />

      <Modal
        title={selectedSellerId ? 'Sửa đơn vị đối tác' : 'Thêm đơn vị đối tác'}
        open={openUpsertSellerModal}
        onOk={() => {
          selectedSellerId ? handleUpdateSeller(selectedSellerId) : handleAddSeller();
        }}
        wrapClassName="add__seller-modal"
        onCancel={() => {
          setOpenUpsertSellerModal(false);
          setSelectedSellerId();
          refreshData();
        }}
        okText={selectedSellerId ? 'Sửa' : 'Thêm'}
        cancelText="Huỷ"
      >
        <div className="add__seller-label">Tên đơn vị đối tác:</div>
        <Input
          placeholder="Vui lòng nhập tên đơn vị đối tác"
          value={sellerName}
          onChange={e => setSellerName(e.target.value)}
        />
        <div className="add__seller-label">Mã số thuế:</div>
        <Input placeholder="Vui lòng nhập mã số thuế" value={taxCode} onChange={e => setTaxCode(e.target.value)} />
      </Modal>
    </div>
  );
};

export default Sellers;
