import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Proposals from './pages/Proposals';
import CreateProposal from './pages/CreateProposal';
import ProposalDetails from './pages/ProposalDetails';
import Results from './pages/Results';
import { useWallet } from './contexts/WalletContext';

function App() {
  const { isConnected } = useWallet();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route 
          path="proposals" 
          element={isConnected ? <Proposals /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="proposals/:id" 
          element={isConnected ? <ProposalDetails /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="create" 
          element={isConnected ? <CreateProposal /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="results" 
          element={isConnected ? <Results /> : <Navigate to="/" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;