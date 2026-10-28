import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import Songs from './pages/Songs';
import SongDetail from './pages/SongDetail';
import Producers from './pages/Producers';
import Songwriters from './pages/Songwriters';
import Contracts from './pages/Contracts';
import Platforms from './pages/Platforms';
import Royalties from './pages/Royalties';
import Payouts from './pages/Payouts';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="artists" element={<Artists />} />
        <Route path="artists/:id" element={<ArtistDetail />} />
        <Route path="albums" element={<Albums />} />
        <Route path="albums/:id" element={<AlbumDetail />} />
        <Route path="songs" element={<Songs />} />
        <Route path="songs/:id" element={<SongDetail />} />
        <Route path="producers" element={<Producers />} />
        <Route path="songwriters" element={<Songwriters />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="platforms" element={<Platforms />} />
        <Route path="royalties" element={<Royalties />} />
        <Route path="payouts" element={<Payouts />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
