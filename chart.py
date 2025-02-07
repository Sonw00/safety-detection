import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd

# 1시간 동안 10분 간격으로 상태를 설정
time_intervals = pd.date_range('2025-02-06 00:00', periods=6, freq='10T')

# 상태를 지정 (정상, 주의, 응급)
statuses = ['정상', '정상', '주의', '응급', '주의', '정상']

# 색상 매핑
status_colors = {'정상': 'green', '주의': 'yellow', '응급': 'red'}
colors = [status_colors[status] for status in statuses]

# 차트 그리기
plt.figure(figsize=(10, 6))
plt.bar(time_intervals, [1]*len(time_intervals), width=0.01, color=colors)

# 차트 꾸미기
plt.title('상태 변화 차트')
plt.xlabel('시간')
plt.ylabel('상태')
plt.xticks(rotation=45)
plt.yticks([])
plt.grid(axis='x')

# 시간 간격에 맞게 x축 포맷 조정
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
plt.gca().xaxis.set_major_locator(mdates.MinuteLocator(interval=10))

plt.show()
