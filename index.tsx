import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js'; // تأكد من وجود هذه المكتبة
import App from './App';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
