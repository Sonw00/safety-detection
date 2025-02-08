import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import dayjs from 'dayjs';


interface TooltipParam {
  data: number;
  axisValue: string;
  seriesName: string;
}


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
        text: 'User Status Over Time',
        left: 'center',
        textStyle: {
          fontSize: 24,         // 제목 글자 크기 증가
          fontWeight: 'bold'    // 제목 글자 굵기 설정
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const statusText = params[0].data[1] === 0 ? '정상' : params[0].data[1] === 1 ? '주의' : '위험';
          return `${params[0].data[0]}<br/>상태: ${statusText}`;
        }
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => dayjs(item.updated_at).format('MM-DD HH:mm:ss')),
        axisTick: {
          alignWithLabel: true  // 눈금을 레이블 중앙에 맞춤
        }
      },
      yAxis: {
        type: 'category',
        data: ['정상', '주의', '위험'],
        axisLabel: {
          formatter: (value: string) => {
            if (value === '정상') return '정상';
            if (value === '주의') return '주의';
            if (value === '위험') return '위험';
            return value;
          }
        },
        axisTick: {
          alignWithLabel: true  // 눈금을 레이블 중앙에 맞춤
        }
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
              if (params.data[1] === 0) return '#5470C6'; // 점의 색깔을 초록색으로 변경
              if (params.data[1] === 1) return '#fac858';
              return '#ee6666';
            },
            borderWidth: 2
          },
          symbolSize: 6,
          //symbol: 'circle' // 점의 모양을 원으로 설정
        }
      ]
    };
    myChart.setOption(option);
  };
  
  const renderPostureChart = (data: { posture: number; updated_at: string }[]) => {
    const chartDom = document.getElementById('posture');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    const sortedData = data.sort((a, b) => 
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );

    const postureNames = [
      'Downstair',
      'Upstair',
      'Running',
      'Sitdown',
      'StandUp',
      'Walking',
      'Fall'
    ];

    const colors = [
      '#5470c6',  // Blue for Downstair
      '#91cc75',  // Green for Upstair
      '#fac858',  // Yellow for Running
      '#ee6666',  // Red for Sitdown
      '#73c0de',  // Light Blue for StandUp
      '#3ba272',  // Teal for Walking
      '#fc8452'   // Orange for Fall
    ];

    const option = {
      title: {
        text: 'User Posture History',
        left: 'center',
        textStyle: {
          fontSize: 24,         // 제목 글자 크기 증가
          fontWeight: 'bold'    // 제목 글자 굵기 설정
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: TooltipParam[]) => {
          const activeSeriesIndex = params.findIndex((param: TooltipParam) => param.data === 1);
          const time = params[0].axisValue;
          const posture = postureNames[activeSeriesIndex];
          return `${time}<br/>Posture: ${posture}`;
        }
      },
      legend: {
        data: postureNames,
        top: 40,
        itemWidth: 27,     // 범례 아이템의 너비
        itemHeight: 17,    // 범례 아이템의 높이
        textStyle: {
          fontSize: 15     // 범례 텍스트 크기
        },
      },
      grid: {
        left: '8%',
        right: '10%',
        bottom: '30%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => dayjs(item.updated_at).format('MM-DD HH:mm:ss')),
        axisLabel: {
          interval: 0,
          rotate: 30  // 날짜 레이블이 겹치지 않도록 회전
        },
        axisTick: {
          alignWithLabel: true  // 눈금을 레이블 중앙에 맞춤
        }
      },
      yAxis: {
        type: 'category',
        max: 1,
        data: ['','자세'],
        axisLabel: {
          //align: 'rignt',  // 눈금 텍스트를 중앙에 위치
          padding: [30, 0, 30,0]  // 텍스트와 눈금 사이의 간격 조정
        }
      },
      series: postureNames.map((name, index) => ({
        name: name,
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        barWidth: '100%',  // bar 너비를 100%로 설정
        //barMaxWidth: 60,  // bar의 최대 너비를 60px로 제한
        barGap: '0%',     // bar 사이의 간격을 0으로 설정
        data: sortedData.map(item => item.posture === index ? 1 : 0),
        itemStyle: {
          color: colors[index]
        }
      }))
    };

    myChart.setOption(option);
    // 창 크기가 변경될 때 차트 크기 조정
    window.addEventListener('resize', () => {
      myChart.resize();
    });
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