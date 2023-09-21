import React from 'react';
import { TreasureHunters, containerStyle, titleStyle, symbols } from './components/TreasureHunters';
import './App.css';

const App = () => {
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Treasure Hunters</div>
      <TreasureHunters symbols={symbols} />
    </div>
  );
};

export default App;
