import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import './side-menu.scss';
import { useMemo } from 'react';
import { publicRoutes } from '../../routes';

let ROUTES_NEED_TO_SHOW = ['/', '/sellers'];

const SideMenu = () => {
  const location = useLocation();
  const { pathname } = location;
  const navigation = useNavigate();

  const getDefaultMenuItems = () => {
    return publicRoutes
      .filter(route => ROUTES_NEED_TO_SHOW.includes(route.path))
      .map(filteredRoute => ({
        key: filteredRoute.path,
        icon: <filteredRoute.pageIcon />,
        label: filteredRoute.label
      }));
  };

  const handleNavigateToAnotherPage = e => {
    const redirectURL = `${e.key}`;

    navigation(redirectURL);
  };

  const defaultActiveMenu = useMemo(() => {
    return pathname ? pathname : '/';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <div className="side__menu-container">
      <Menu
        defaultSelectedKeys={[defaultActiveMenu]}
        mode="inline"
        theme="dark"
        items={getDefaultMenuItems()}
        onClick={handleNavigateToAnotherPage}
      />
    </div>
  );
};
export default SideMenu;
