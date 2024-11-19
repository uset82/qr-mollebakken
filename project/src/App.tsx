import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ArtworkView } from './pages/ArtworkView';
import { NetworkStatus } from './components/NetworkStatus';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artwork/:id" element={<ArtworkView />} />
        </Routes>
      </Layout>
      <NetworkStatus />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;