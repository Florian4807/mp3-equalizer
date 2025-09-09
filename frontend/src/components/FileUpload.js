import React, { useState, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadStart, onUploadComplete, onUploadError }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      if (file.type === 'audio/mp3' || file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
        validFiles.push(file);
      } else {
        errors.push(file.name);
      }
    });

    if (errors.length > 0) {
      alert(`The following files are not MP3 files and will be ignored: ${errors.join(', ')}`);
    }

    return validFiles;
  };

  const handleFileSelect = (files) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select MP3 files to upload');
      return;
    }

    setUploading(true);
    onUploadStart();

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/upload-mp3s', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
      });

      onUploadComplete(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to process files. ';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">🎵</div>
        <div className="upload-text">
          Drop MP3 files here or click to select
        </div>
        <div className="upload-subtext">
          Select multiple MP3 files to equalize their volumes
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="file-input"
        multiple
        accept=".mp3,audio/mp3,audio/mpeg"
        onChange={handleFileInputChange}
      />

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({selectedFiles.length}):</h4>
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '15px' }}>
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Processing...' : `Equalize ${selectedFiles.length} Files`}
            </button>
            <button
              className="upload-button secondary-button"
              onClick={clearFiles}
              disabled={uploading}
              style={{ marginLeft: '10px' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;