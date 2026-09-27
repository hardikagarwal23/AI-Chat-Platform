import React, { useState } from 'react';

import Navbar from './components/Navbar';
import ChatPage from './components/ChatPage';
import DashboardPage from './components/DashboardPage';

export default function App() {
  const [page, setPage] = useState('chat');

  return (
    <>
      <Navbar page={page} setPage={setPage} />

      {page === 'chat' ? (
        <ChatPage />
      ) : (
        <DashboardPage />
      )}
    </>
  );
}