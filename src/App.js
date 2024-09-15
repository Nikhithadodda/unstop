import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


function TrainReservationApp() {
  const [stList, setstList] = useState([]);
  const [stsTor, setstsTor] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    loadstData();
  }, []);

  const loadstData = () => {
    setIsLoading(true);
    axios.get('https://train-ticketbooking-challange.onrender.com/st')
      .then(response => {
        const allsts = response.data.all_sts.split('');
        setstList(allsts);
      })
      .finally(() => setIsLoading(false));
  };

  const rst = () => {
    if (stsTor < 1 || stsTor > 7) {
      alert('Please enter a valid number of sts (between 1 and 7).');
      return;
    }

    setIsLoading(true);
    axios.post('https://train-ticketbooking-challange.onrender.com/r', { numsts: stsTor })
      .then(response => {
        if (response.data.success) {
          alert(`rd sts: ${response.data.rdsts.map(st => st + 1).join(', ')}`);
          loadstData();
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="train-reservation-app">
      <h1>Train st Reservation</h1>

      <div className="st-grid">
        {isLoading ? (
          <p className="loading-text">Server reloading... Please wait.</p>
        ) : stList.map((st, index) => (
          <stComponent key={index} number={index + 1} isrd={st === '1'} />
        ))}
      </div>

      <div className="reservation-panel">
        <label htmlFor="stsTor">Number of sts to r (1-7): </label>
        <input
          type="number"
          id="stsTor"
          min="1"
          max="7"
          value={stsTor}
          onChange={e => setstsTor(e.target.value)}
        />
        <button onClick={rst} disabled={isLoading}>
          r sts
        </button>
      </div>
    </div>
  );
}

export default TrainReservationApp;
