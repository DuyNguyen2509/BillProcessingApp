import './home.scss';
import { Table } from 'antd';

const TEST_DATA = [
  {
    invoiceId: '12312321',
    invoiceDate: '12/2/2022',
    taxCode: 1200,
    subTotal: 5000,
    vat: 120,
    total: 6200
  },

  {
    invoiceId: '213213',
    invoiceDate: '12/2/2022',
    taxCode: 1200,
    subTotal: 5000,
    vat: 120,
    total: 6200
  },

  {
    invoiceId: '324214',
    invoiceDate: '12/2/2022',
    taxCode: 1200,
    subTotal: 5000,
    vat: 120,
    total: 6200
  },

  {
    invoiceId: '12314214124122321',
    invoiceDate: '12/2/2022',
    taxCode: 1200,
    subTotal: 5000,
    vat: 120,
    total: 6200
  }
];
const Home = () => {
  const columns = [
    {
      title: 'Mã hoá đơn',
      dataIndex: 'invoiceId',
      key: 'invoiceId'
    },
    {
      title: 'Ngày hoá đơn',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate'
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode'
    },
    {
      title: 'Tổng hàng hoá',
      dataIndex: 'subTotal',
      key: 'subTotal'
    },
    {
      title: 'Thuế',
      dataIndex: 'vat',
      key: 'vat'
    },
    {
      title: 'Tổng hoá đơn',
      dataIndex: 'total',
      key: 'total'
    }
  ];
  return (
    <div className="home__container">
      <Table columns={columns} dataSource={TEST_DATA} rowKey={record => record.invoiceId} />
    </div>
  );
};

export default Home;
