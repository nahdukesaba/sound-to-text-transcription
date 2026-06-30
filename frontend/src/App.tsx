import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, History, FileText, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface Transcription {
  filename: string;
  transcription: string;
  created_at: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [history, setHistory] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<'upload' | 'history'>('upload');

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/transcribe/`, formData);
      setTranscription(response.data.transcription);
      setFile(null);
    } catch (error) {
      console.error('Error transcribing:', error);
      alert('Transcription failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sound to Text</h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => setView('upload')}
              className={`px-4 py-2 rounded-lg flex items-center ${view === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <Upload className="mr-2" size={20} /> Upload
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-lg flex items-center ${view === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <History className="mr-2" size={20} /> History
            </button>
          </nav>
        </header>

        <main className="bg-white rounded-xl shadow-md p-6">
          {view === 'upload' ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="audio/*"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-lg text-gray-600">
                    {file ? file.name : 'Click to select an audio file'}
                  </p>
                </label>
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 flex justify-center items-center"
              >
                {loading ? <><Loader2 className="animate-spin mr-2" /> Transcribing...</> : 'Start Transcription'}
              </button>

              {transcription && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FileText className="mr-2" /> Result
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {transcription}
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([transcription], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'transcription.txt';
                      a.click();
                    }}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Download as .txt
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Transcription History</h2>
              {history.length === 0 ? (
                <p className="text-gray-500">No history found.</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-700">{item.filename}</h3>
                      <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.transcription}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
