import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import DownloadResult from './components/DownloadResult';
import './App.css';

function App() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadComplete = (uploadResult) => {
    setResult(uploadResult);
    setProcessing(false);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setProcessing(false);
    setResult(null);
  };

  const handleUploadStart = () => {
    setProcessing(true);
    setError(null);
    setResult(null);
  };

  const resetApp = () => {
    setProcessing(false);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎵 MP3 Equalizer</h1>
          <p>Upload your MP3 files and get them volume-equalized for consistent loudness</p>
        </header>

        <main className="main-content">
          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={resetApp} className="reset-button">
                Try Again
              </button>
            </div>
          )}

          {processing && (
            <ProcessingStatus />
          )}

          {result && (
            <DownloadResult 
              result={result} 
              onReset={resetApp}
            />
          )}

          {!processing && !result && !error && (
            <FileUpload 
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          )}
        </main>

        <footer className="footer">
          <p>Perfect for DJs and music enthusiasts who want consistent volume levels across their tracks</p>
        </footer>
      </div>
    </div>
  );
}

export default App;