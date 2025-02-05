import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    age: '',
    address: '',
    detailed_address: '',
    phone_num: '',
    guard_name: '',
    guard_phone_num: ''
  });
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetch('/api/csrf_token/');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      navigate('/login'); // 회원가입이 완료되면 로그인 페이지로 이동
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button> {/* 뒤로가기 버튼 */}
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="id" placeholder="ID" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
        <input type="text" name="detailed_address" placeholder="Detailed Address" onChange={handleChange} />
        <input type="text" name="phone_num" placeholder="Phone Number" onChange={handleChange} required />
        <input type="text" name="guard_name" placeholder="Guard Name" onChange={handleChange} />
        <input type="text" name="guard_phone_num" placeholder="Guard Phone Number" onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;