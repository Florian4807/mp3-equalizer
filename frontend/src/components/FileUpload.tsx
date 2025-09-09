import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { equalizeVolume, loadFFmpeg } from '../utils/ffmpeg';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FileUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

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

  const handleFileSelect = (files: FileList): void => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const handleProcessFiles = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      alert('Please select MP3 files to process');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Load FFmpeg first
      await loadFFmpeg();
      
      const zip = new JSZip();
      const processedFiles: File[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        try {
          const processedBlob = await equalizeVolume(file);
          const processedFile = new File([processedBlob], `equalized_${file.name}`, { type: 'audio/mpeg' });
          processedFiles.push(processedFile);
          zip.file(processedFile.name, processedBlob);
          
          setProgress(((i + 1) / selectedFiles.length) * 100);
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          alert(`Failed to process ${file.name}. Skipping this file.`);
        }
      }

      if (processedFiles.length === 0) {
        alert('No files were successfully processed.');
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'equalized_mp3s.zip');

      alert(`Successfully processed ${processedFiles.length} out of ${selectedFiles.length} MP3 files. The zip file will be downloaded shortly.`);

    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process files. Please check the console for details and ensure your browser supports FFmpeg.');
    } finally {
      setProcessing(false);
    }
  };

  const clearFiles = (): void => {
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