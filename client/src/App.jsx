import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AnalysisPage } from './pages/AnalysisPage';
import { NewsPage } from './pages/NewsPage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#f3f4f6',
            border: '1px solid rgba(132, 204, 22, 0.3)',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#84cc16',
              secondary: '#1a1a1a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1a1a1a',
            },
          },
        }}
      />
      
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

