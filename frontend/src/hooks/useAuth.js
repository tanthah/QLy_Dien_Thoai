import { useState } from 'react';

const getSavedUser = () => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  return savedToken && savedUser ? JSON.parse(savedUser) : null;
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(getSavedUser);
  const [currentPage, setCurrentPage] = useState('home');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  return {
    currentUser,
    currentPage,
    handleLoginSuccess,
    handleLogout,
    navigateTo: setCurrentPage,
  };
};
