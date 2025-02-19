import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = () => {
  // ✅ Initialize from localStorage to persist across navigation
  const [selectedImage, setSelectedImage] = useState(localStorage.getItem('breathSelectedBackground') || '');

  useEffect(() => {
    const savedBackground = localStorage.getItem('breathSelectedBackground');
    if (savedBackground && savedBackground !== selectedImage) {
      setSelectedImage(savedBackground); // ✅ Sync background when changed
    }
  }, [selectedImage]);

  return (
    <>
      <Header selectedImage={selectedImage} />
      <main>
        <Outlet context={{ selectedImage, setSelectedImage }} /> {/* ✅ Pass updated background */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
