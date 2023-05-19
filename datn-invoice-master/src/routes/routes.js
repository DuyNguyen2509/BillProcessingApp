import config from '../config';
import Home from '../pages/home/home';
import Sellers from '../pages/sellers/sellers';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons';
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
  }
];

export { publicRoutes };
