import config from '../config';
import Home from '../pages/home/home';
import Sellers from '../pages/sellers/sellers';
import StatisticPage from '../pages/statistic/statistic';
import { AppstoreOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
const publicRoutes = [
  {
    path: config.routes.home,
    element: Home,
    label: 'Hoá đơn',
    pageIcon: AppstoreOutlined,
    needShowSideMenu: true
  },
  {
    path: config.routes.sellers,
    element: Sellers,
    label: 'Đơn vị bán hàng',
    pageIcon: UserOutlined,
    needShowSideMenu: true
  },
  {
    path: config.routes.statistic,
    element: StatisticPage,
    label: 'Thống kê',
    pageIcon: BarChartOutlined,
    needShowSideMenu: true
  }
];

export { publicRoutes };
