import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const Main = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; age: number } | null>(null);
  const [statuses, setStatuses] = useState<{ status: number; updated_at: string }[]>([]);
  const [postures, setPostures] = useState<{ posture: number; updated_at: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('/api/check_login/');
        setIsLoggedIn(response.data.is_logged_in);
        if (response.data.is_logged_in) {
          const userResponse = await axios.get('/api/user_info/');
          console.log('User Info:', userResponse.data); // 응답 데이터 출력
          setUserInfo(userResponse.data);
          fetchUserStatus();
          fetchUserPosture();
          updateUserStatus(); // 로그인 직후 사용자 상태 갱신
          updateUserPosture(); // 로그인 직후 사용자 자세 갱신
        }
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

    // 10분 간격으로 사용자 상태 갱신
    const interval = setInterval(() => {
      if (isLoggedIn) {
        updateUserStatus();
        updateUserPosture();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const fetchUserStatus = async () => {
    try {
      const response = await axios.get('/api/get_status/');
      setStatuses(response.data.statuses);
      renderStatusChart(response.data.statuses);
    } catch (error) {
      console.error('사용자 상태를 가져오는 중 오류 발생:', error);
    }
  };

  const updateUserStatus = async () => {
    try {
      const response = await axios.post('/api/update_status/', {}, {
        headers: {
          'X-CSRFToken': csrfToken || ''
        }
      });
      fetchUserStatus();
    } catch (error) {
      console.error('사용자 상태를 갱신하는 중 오류 발생:', error);
    }
  };

  const fetchUserPosture = async () => {
    try {
      const response = await axios.get('/api/get_posture/');
      setPostures(response.data.postures);
      renderPostureChart(response.data.postures);
    } catch (error) {
      console.error('사용자 자세를 가져오는 중 오류 발생:', error);
    }
  };

  const updateUserPosture = async () => {
    try {
      const response = await axios.post('/api/update_posture/', {}, {
        headers: {
          'X-CSRFToken': csrfToken || ''
        }
      });
      fetchUserPosture();
    } catch (error) {
      console.error('사용자 자세를 갱신하는 중 오류 발생:', error);
    }
  };

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

  const renderStatusChart = (data: { status: number; updated_at: string }[]) => {
    const chartDom = document.getElementById('main');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    const sortedData = data.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    const option = {
      title: {
        text: 'User Status Over Time'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const statusText = params[0].data[1] === 1 ? '정상' : params[0].data[1] === 2 ? '주의' : '위험';
          return `${params[0].data[0]}<br/>상태: ${statusText}`;
        }
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => dayjs(item.updated_at).format('MM-DD HH:mm:ss'))
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: sortedData.map(item => [dayjs(item.updated_at).format('MM-DD HH:mm:ss'), item.status]),
          type: 'line',
          lineStyle: {
            color: '#5470C6' // 라인 색깔
          },
          itemStyle: {
            color: (params: any) => {
              if (params.data[1] === 1) return 'green'; // 점의 색깔을 초록색으로 변경
              if (params.data[1] === 2) return 'yellow';
              return 'red';
            },
            borderWidth: 2
          },
          symbolSize: 10,
          symbol: 'circle' // 점의 모양을 원으로 설정
        }
      ]
    };
    myChart.setOption(option);
  };

  const renderPostureChart = (data: { posture: number; updated_at: string }[]) => {
    const chartDom = document.getElementById('posture');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    const postureText = ['Downstair', 'Upstair', 'Running', 'Sitdown', 'StandUp', 'Walking', 'Fall'];
    const sortedData = data.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const postureText = ['Downstair', 'Upstair', 'Running', 'Sitdown', 'StandUp', 'Walking', 'Fall'];
          const posture = params[0].data[1];
          return `${params[0].data[0]}<br/>자세: ${postureText[posture]}`;
        }
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '70%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['posture']
      },
      series: postureText.map((text, index) => ({
        name: text,
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: sortedData.map(item => (item.posture === index ? 1 : 0))
      }))
    };
    myChart.setOption(option);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>Login</button>
            <button onClick={() => navigate('/register')} style={{ marginLeft: '10px' }}>Register</button>
          </>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLoggedIn && userInfo ? (
          <h1>{userInfo.name}님 ({userInfo.age}세), 현재 웹에 접속하셨습니다!</h1>
        ) : (
          <h1>Welcome to the Main Page</h1>
        )}
      </div>
      <div id="main" style={{ width: '100%', height: '400px' }}></div>
      <div id="posture" style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
    </div>
  );
};

export default Main;