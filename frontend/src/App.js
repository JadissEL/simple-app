import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [namesList, setNamesList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/names')
      .then((res) => res.json())
      .then((data) => setNamesList(data.names))
      .catch((error) => console.log('Error:', error));
  }, []);

  const handleAddName = () => {
    fetch('http://localhost:3001/add-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNamesList([...namesList, data]);
        setName('');
      })
      .catch((error) => console.log('Error:', error));
  };

  return (
    <div className="App">
      <h1>Simple Name App with Backend and Frontend </h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAddName}>Add Name</button>
      <ul>
        {namesList.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
