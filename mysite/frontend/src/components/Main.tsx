import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('/api/check_login/');
        setIsLoggedIn(response.data.is_logged_in);
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
      }
    };

    // CSRF 토큰을 가져오는 함수
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/csrf_token/');
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('CSRF 토큰을 가져오는 중 오류 발생:', error);
      }
    };

    checkLoginStatus();
    fetchCsrfToken();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout/', {}, {
        headers: {
          'X-CSRFToken': csrfToken || ''
        }
      });
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <h1>Welcome to the Main Page</h1>
      {isLoggedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </>
      )}
    </div>
  );
};

export default Main;