import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
    // CSRF 토큰을 가져오는 함수
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/csrf_token/');
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('CSRF 토큰을 가져오는 중 오류 발생:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/login/', {
        id,
        password
      }, {
        headers: {
          'X-CSRFToken': csrfToken || ''
        }
      });
      console.log('로그인 성공:', response.data);
      // 로그인 성공 시 메인 페이지로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button> {/* 뒤로가기 버튼 */}
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID:</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">로그인</button>
        <button type="button" onClick={() => navigate('/register')}>회원가입</button>
      </form>
    </div>
  );
};

export default Login;