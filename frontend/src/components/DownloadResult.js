import React from 'react';

const DownloadResult = ({ result, onReset }) => {
  const handleDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = '/download-processed';
    link.download = 'equalized_mp3s.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="download-container">
      <div className="success-icon">✅</div>
      <div className="success-message">
        Processing Complete!
      </div>
      <div className="success-subtext">
        Successfully processed {result.processed_count} MP3 files. 
        All files have been normalized to consistent volume levels.
      </div>
      
      <div style={{ marginTop: '25px' }}>
        <button
          className="download-button"
          onClick={handleDownload}
        >
          📥 Download Equalized Files
        </button>
        
        <button
          className="download-button secondary-button"
          onClick={onReset}
          style={{ marginLeft: '10px' }}
        >
          🔄 Process More Files
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <p>
          <strong>What was done:</strong><br/>
          • Analyzed loudness levels of each MP3 file<br/>
          • Normalized all tracks to -23 LUFS (broadcast standard)<br/>
          • Maintained audio quality with 320kbps bitrate<br/>
          • Ready for professional DJ use or playlist creation
        </p>
      </div>
    </div>
  );
};

export default DownloadResult;