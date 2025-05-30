// Adding React library for component creation
import React from 'react';
// Adding ReactDOM for rendering to the browser
import ReactDOM from 'react-dom/client';
// Adding global styles
import './index.css';
// Adding main App component
import App from './App.jsx';  // Note the .jsx extension
// Adding root element creation for React application
const root = ReactDOM.createRoot(document.getElementById('root'));
// Adding application render with strict mode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 