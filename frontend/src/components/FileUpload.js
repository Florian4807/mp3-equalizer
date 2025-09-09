import React, { useState, useRef } from 'react';
import { equalizeVolume, loadFFmpeg } from '../utils/ffmpeg';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select MP3 files to process');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      await loadFFmpeg();
      const zip = new JSZip();
      const processedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const processedBlob = await equalizeVolume(file);
        const processedFile = new File([processedBlob], `equalized_${file.name}`, { type: 'audio/mpeg' });
        processedFiles.push(processedFile);
        zip.file(processedFile.name, processedBlob);
        setProgress(((i + 1) / selectedFiles.length) * 100);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'equalized_mp3s.zip');

      alert(`Successfully processed ${processedFiles.length} MP3 files. The zip file will be downloaded shortly.`);

    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process files. Please check the console for details.');
    } finally {
      setProcessing(false);
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
              onClick={handleProcessFiles}
              disabled={processing}
            >
              {processing ? `Processing... ${Math.round(progress)}%` : `Equalize ${selectedFiles.length} Files`}
            </button>
            <button
              className="upload-button secondary-button"
              onClick={clearFiles}
              disabled={processing}
              style={{ marginLeft: '10px' }}
            >
              Clear
            </button>
          </div>
          {processing && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;