import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { initVetCareCloudSync } from './services/cloudSync';
import './index.css';

// Inicializar sincronización multi-dispositivo y hard-pull de inmediato
initVetCareCloudSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
