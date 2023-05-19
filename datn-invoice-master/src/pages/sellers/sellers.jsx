import './serllers.scss';
import { Table } from 'antd';

const TEST_DATA = [
  {
    sellerId: '12312321',
    sellerName: '12/2/2022',
    taxCode: 1200
  },

  {
    sellerId: '213213',
    sellerName: '12/2/2022',
    taxCode: 1200
  },

  {
    sellerId: '324214',
    sellerName: '12/2/2022',
    taxCode: 1200
  },

  {
    sellerId: '12314214124122321',
    sellerName: '12/2/2022',
    taxCode: 1200
  }
];

const Sellers = () => {
  const columns = [
    {
      title: 'Mã đơn vị bán hàng',
      dataIndex: 'sellerId',
      key: 'sellerId'
    },
    {
      title: 'Tên đơn vị bán hàng',
      dataIndex: 'sellerName',
      key: 'sellerName'
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode'
    }
  ];
  return (
    <div className="sellers__container">
      <Table columns={columns} dataSource={TEST_DATA} rowKey />
    </div>
  );
};

export default Sellers;
