import ReactDOM from 'react-dom/client';
import App from './App';

// AG Grid Enterprise — register BEFORE any grid renders
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Bryntum theme — the alias makes this resolve to the trial package
import '@bryntum/schedulerpro/stockholm-dark.css';

import './index.css';

// No StrictMode — Bryntum scheduler has known issues with double-mount
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);