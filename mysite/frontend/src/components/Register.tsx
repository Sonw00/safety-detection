import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
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
  const [errors, setErrors] = useState<string[]>([]);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await axios.get('/api/csrf_token/');
      setCsrfToken(response.data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'id') {
      setIsIdChecked(false); // ID가 변경되면 중복 검사 상태를 초기화
    }
  };

  const handleIdCheck = async () => {
    try {
      const response = await axios.post('/api/check_id/', { id: formData.id }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || ''
        }
      });
      if (response.data.isAvailable) {
        alert('사용 가능한 ID입니다.');
        setIsIdChecked(true);
      } else {
        alert('이미 사용 중인 ID입니다.');
        setIsIdChecked(false);
      }
    } catch (error) {
      console.error('ID 중복 검사 중 오류 발생:', error);
      setIsIdChecked(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    if (!isIdChecked) {
      setErrors(['ID 중복 검사를 완료해주세요.']);
      return;
    }
    try {
      const response = await axios.post('/api/signup/', formData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || ''
        }
      });
      console.log('회원가입 성공:', response.data);
      navigate('/login');
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['회원가입 중 오류가 발생했습니다.']);
      }
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button> {/* 뒤로가기 버튼 */}
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID:</label>
          <input type="text" name="id" value={formData.id} onChange={handleChange} />
          <button type="button" onClick={handleIdCheck}>중복 검사</button>
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <label>Age:</label>
          <input type="text" name="age" value={formData.age} onChange={handleChange} />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div>
          <label>Detailed Address:</label>
          <input type="text" name="detailed_address" value={formData.detailed_address} onChange={handleChange} />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phone_num" value={formData.phone_num} onChange={handleChange} />
        </div>
        <div>
          <label>Guard Name:</label>
          <input type="text" name="guard_name" value={formData.guard_name} onChange={handleChange} />
        </div>
        <div>
          <label>Guard Phone Number:</label>
          <input type="text" name="guard_phone_num" value={formData.guard_phone_num} onChange={handleChange} />
        </div>
        <button type="submit">등록</button>
        <button type="button" onClick={() => navigate('/login')}>로그인</button>
      </form>
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Register;