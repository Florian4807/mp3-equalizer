import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎵 MP3 Equalizer</h1>
          <p>Upload your MP3 files and get them volume-equalized for consistent loudness</p>
        </header>

        <main className="main-content">
          <FileUpload />
        </main>

        <footer className="footer">
          <p>Perfect for DJs and music enthusiasts who want consistent volume levels across their tracks</p>
        </footer>
      </div>
    </div>
  );
};

export default App;