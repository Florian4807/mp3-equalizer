import React from 'react';

const ProcessingStatus = () => {
  return (
    <div className="processing-container">
      <div className="spinner"></div>
      <div className="processing-text">
        Processing Your MP3 Files...
      </div>
      <div className="processing-subtext">
        Analyzing and equalizing volume levels. This may take a few minutes.
      </div>
    </div>
  );
};

export default ProcessingStatus;