import { publicRoutes } from './routes/routes';
import PageLayout from './layout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {publicRoutes.map((route, index) => {
        return <Route path={route.path} key={index} element={<PageLayout>{<route.element />}</PageLayout>} />;
      })}
    </Routes>
  );
}

export default App;
