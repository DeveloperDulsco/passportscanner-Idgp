import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Home from './Components/Home/Home';
import NotFound from './Components/NotFound/NotFound'; // Import NotFound component

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/home/:reservationId" element={<Home />} />
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
