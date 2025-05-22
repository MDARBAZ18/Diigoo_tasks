import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-subtle to-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;