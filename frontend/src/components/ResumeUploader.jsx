import { FiUploadCloud, FiFile, FiCheck } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResumeUploader({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10 MB');
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const res = await resumeAPI.upload(file);
      toast.success('Resume uploaded and parsed successfully!');
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload resume';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`glass-card p-8 text-center cursor-pointer transition-all duration-300 ${
        dragging ? 'border-primary-500/50 bg-primary-500/5 scale-[1.02]' : 'hover:border-primary-500/20'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div className="py-6">
          <div className="w-14 h-14 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Parsing resume with AI...</p>
          <p className="text-dark-400 text-sm mt-1">Extracting skills, education & experience</p>
        </div>
      ) : fileName ? (
        <div className="py-6">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/15 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-accent-400 text-2xl" />
          </div>
          <p className="text-white font-medium flex items-center justify-center gap-2">
            <FiFile /> {fileName}
          </p>
          <p className="text-dark-400 text-sm mt-1">Click or drag to replace</p>
        </div>
      ) : (
        <div className="py-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 animate-float">
            <FiUploadCloud className="text-primary-400 text-2xl" />
          </div>
          <p className="text-white font-medium">Drag & drop your resume here</p>
          <p className="text-dark-400 text-sm mt-1">or click to browse • PDF, DOC, DOCX, TXT</p>
          <p className="text-dark-500 text-xs mt-3">Max file size: 10 MB</p>
        </div>
      )}
    </div>
  );
}
