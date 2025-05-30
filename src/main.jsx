// Adding React library for component creation
import React from 'react'
// Adding ReactDOM for browser rendering
import ReactDOM from 'react-dom/client'
// Adding main App component
import App from './App.jsx'
// Adding global styles
import './index.css'
// Adding root element creation and rendering setup
ReactDOM.createRoot(document.getElementById('root')).render(
  // Adding strict mode wrapper for development checks
  <React.StrictMode>
    {/* Adding main App component to DOM */}
    <App />
  </React.StrictMode>,
)
