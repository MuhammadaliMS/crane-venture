import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PortfolioCommandCenter } from './components/PortfolioCommandCenter';
import { ActionMatrix } from './components/ActionMatrix';
import { CompanyDetail } from './components/CompanyDetail';
import { BoardPrep } from './components/BoardPrep';
import { PortfolioReview } from './components/PortfolioReview';
import { SearchDiscovery } from './components/SearchDiscovery';
import { IntelligenceHub } from './components/IntelligenceHub';
import { Settings } from './components/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'portfolio', Component: PortfolioCommandCenter },
      { path: 'matrix', Component: ActionMatrix },
      { path: 'company/:id', Component: CompanyDetail },
      { path: 'board-prep', Component: BoardPrep },
      { path: 'review', Component: PortfolioReview },
      { path: 'search', Component: SearchDiscovery },
      { path: 'intelligence', Component: IntelligenceHub },
      { path: 'settings', Component: Settings },
    ],
  },
]);
