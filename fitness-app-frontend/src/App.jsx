import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Dumbbell, Watch, User } from 'lucide-react';
import api from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const FitnessApp = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  
  // 状态管理
  const [activity, setActivity] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 加载数据
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [activityData, profileData, workoutsData, devicesData, weeklyData, statsData] = await Promise.all([
        api.getTodayActivity().catch(() => null),
        api.getProfile().catch(() => null),
        api.getWorkouts().catch(() => []),
        api.getDevices().catch(() => []),
        api.getWeeklyActivity().catch(() => []),
        api.getActivityStats().catch(() => null)
      ]);
      
      setActivity(activityData);
      setProfile(profileData);
      setWorkouts(workoutsData);
      setDevices(devicesData);
      setWeeklyActivity(weeklyData);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 完成训练
  const handleCompleteWorkout = async (workoutId) => {
    try {
      await api.completeWorkout(workoutId);
      const [updatedWorkouts, updatedActivity] = await Promise.all([
        api.getWorkouts(),
        api.getTodayActivity()
      ]);
      setWorkouts(updatedWorkouts);
      setActivity(updatedActivity);
    } catch (error) {
      console.error('完成训练失败:', error);
      alert('完成训练失败');
    }
  };

  // 更新设备
  const handleUpdateDevice = async (deviceId, updates) => {
    try {
      await api.updateDevice(deviceId, updates);
      const updatedDevices = await api.getDevices();
      setDevices(updatedDevices);
    } catch (error) {
      console.error('更新设备失败:', error);
      alert('更新设备失败');
    }
  };

  // 导航栏组件
  const NavigationBar = () => {
    const navItems = [
      { id: 'home', icon: Home, label: '首页' },
      { id: 'data', icon: BarChart3, label: '数据' },
      { id: 'train', icon: Dumbbell, label: '训练' },
      { id: 'device', icon: Watch, label: '设备' },
      { id: 'profile', icon: User, label: '我的' }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#1F1F1F] border-t border-[#333] px-6 py-4 flex justify-around items-center max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center space-y-1"
            >
              <Icon 
                size={24} 
                className={isActive ? 'text-[#0066FF]' : 'text-[#888]'}
              />
              <span className={`text-xs ${isActive ? 'text-[#0066FF]' : 'text-[#888]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // 状态栏组件
  const StatusBar = () => (
    <div className="flex justify-between items-center px-6 py-4">
      <span className="text-white font-bold text-sm">
        {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-3 border border-white rounded-sm relative">
          <div className="absolute left-0.5 top-0.5 w-4 h-2 bg-white rounded-sm"></div>
        </div>
      </div>
    </div>
  );

  // 主页面
  const HomePage = () => {
    if (!activity) return <div className="p-6 text-white">加载中...</div>;

    const stepsPercentage = (activity.steps / (profile?.dailyStepGoal || 10000)) * 100;
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (circumference * Math.min(stepsPercentage, 100)) / 100;

    // 根据时间显示问候语
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

    return (
      <div className="p-6 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{greeting}，</h1>
            <h1 className="text-3xl font-bold text-[#0066FF]">{user?.firstName || '用户'}</h1>
          </div>
          <div className="w-12 h-12 bg-[#333] rounded-full"></div>
        </div>

        {/* 活动环 */}
        <div className="flex justify-center my-12">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#333" strokeWidth="15" />
              <circle
                cx="100" cy="100" r="80" fill="none" stroke="#0066FF" strokeWidth="15"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{activity.steps.toLocaleString()}</span>
              <span className="text-sm text-[#AAA]">步数</span>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#AAA] text-sm mb-2">卡路里</p>
            <p className="text-white text-2xl font-bold mb-1">{activity.calories}</p>
            <p className="text-[#00FF7F] text-xs">千卡</p>
          </div>
          <div className="bg-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#AAA] text-sm mb-2">距离</p>
            <p className="text-white text-2xl font-bold mb-1">{activity.distance}</p>
            <p className="text-[#0066FF] text-xs">公里</p>
          </div>
        </div>

        {/* 今日计划 */}
        <div>
          <h2 className="text-white text-lg font-bold mb-3">今日计划</h2>
          {workouts.filter(w => !w.isCompleted).slice(0, 1).map(workout => (
            <div key={workout.id} className="bg-[#0066FF] bg-opacity-20 border border-[#0066FF] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold mb-1">{workout.title}</p>
                <p className="text-[#AAA] text-sm">{workout.duration} 分钟 • {workout.level === 'beginner' ? '初级' : workout.level === 'intermediate' ? '中级' : '高级'}</p>
              </div>
              <button 
                onClick={() => handleCompleteWorkout(workout.id)}
                className="w-10 h-10 bg-[#0066FF] rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors"
              >
                <span className="text-white text-xl">▶</span>
              </button>
            </div>
          ))}
          {workouts.filter(w => !w.isCompleted).length === 0 && (
            <div className="bg-[#2A2A2A] rounded-xl p-4 text-center text-[#AAA]">
              今日无训练计划
            </div>
          )}
        </div>
      </div>
    );
  };

  // 数据分析页面
  const DataPage = () => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const maxSteps = Math.max(...weeklyActivity.map(a => a.steps || 0), 1);

    return (
      <div className="p-6 pb-24">
        <h1 className="text-white text-2xl font-bold mb-6">数据分析</h1>

        {/* 周活动柱状图 */}
        <div className="mb-6">
          <h2 className="text-white text-base font-semibold mb-3">本周活动</h2>
          <div className="bg-[#2A2A2A] rounded-xl p-4 h-52">
            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyActivity.slice(-7).map((activity, index) => {
                const height = (activity.steps / maxSteps) * 100;
                const isToday = index === weeklyActivity.length - 1;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        isToday ? 'bg-[#00FF7F]' : 'bg-[#0066FF]'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-[#888] text-xs">{days[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 体重趋势 */}
        <div className="mb-6">
          <h2 className="text-white text-base font-semibold mb-3">体重趋势</h2>
          <div className="bg-[#2A2A2A] rounded-xl p-4 h-44 relative">
            <svg className="w-full h-full" viewBox="0 0 300 150">
              <polyline
                points="10,100 60,90 110,95 160,70 210,60 260,50"
                fill="none" stroke="#FF6B35" strokeWidth="3"
              />
              <circle cx="260" cy="50" r="4" fill="#FF6B35" />
            </svg>
            <div className="absolute top-4 right-4 text-[#FF6B35] text-sm font-semibold">
              {profile?.weight || '--'} 公斤
            </div>
          </div>
        </div>

        {/* 统计网格 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
            <p className="text-[#AAA] text-xs mb-2">BMI</p>
            <p className="text-white text-lg font-bold">{profile?.bmi?.toFixed(1) || '--'}</p>
          </div>
          <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
            <p className="text-[#AAA] text-xs mb-2">体脂率</p>
            <p className="text-white text-lg font-bold">{profile?.bodyFat?.toFixed(1) || '--'}%</p>
          </div>
          <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
            <p className="text-[#AAA] text-xs mb-2">肌肉</p>
            <p className="text-white text-lg font-bold">{profile?.muscleMass || '--'}kg</p>
          </div>
        </div>
      </div>
    );
  };

  // 训练页面
  const TrainPage = () => {
    const categoryMap = {
      'all': '全部',
      'cardio': '有氧',
      'strength': '力量',
      'flexibility': '柔韧'
    };

    const levelMap = {
      'beginner': '初级',
      'intermediate': '中级',
      'advanced': '高级'
    };

    const filteredWorkouts = selectedCategory === 'all' 
      ? workouts 
      : workouts.filter(w => w.category === selectedCategory);

    const featuredWorkout = filteredWorkouts.find(w => !w.isCompleted) || filteredWorkouts[0];
    const otherWorkouts = filteredWorkouts.filter(w => w.id !== featuredWorkout?.id);

    return (
      <div className="p-6 pb-24">
        <h1 className="text-white text-2xl font-bold mb-4">训练</h1>

        {/* 搜索框 */}
        <div className="bg-[#333] rounded-full px-6 py-3 mb-6">
          <input
            type="text"
            placeholder="搜索训练..."
            className="bg-transparent text-white w-full outline-none placeholder-[#666]"
          />
        </div>

        {/* 分类标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'cardio', 'strength', 'flexibility'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-[#333] text-[#AAA] hover:bg-[#444]'
              }`}
            >
              {categoryMap[category]}
            </button>
          ))}
        </div>

        {/* 特色训练 */}
        {featuredWorkout && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-3">精选训练</h2>
            <div className="bg-[#333] rounded-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#0066FF] to-[#00FF7F] flex items-center justify-center">
                <div className="text-white text-6xl font-bold opacity-20">
                  {featuredWorkout.category === 'cardio' ? '🏃' : 
                   featuredWorkout.category === 'strength' ? '💪' : '🧘'}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{featuredWorkout.title}</h3>
                    <p className="text-[#AAA] text-sm mb-2">{featuredWorkout.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[#0066FF]">⏱ {featuredWorkout.duration} 分钟</span>
                      <span className="text-[#00FF7F]">🔥 {featuredWorkout.calories} 千卡</span>
                      <span className="text-[#FF6B35]">📊 {levelMap[featuredWorkout.level]}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCompleteWorkout(featuredWorkout.id)}
                  disabled={featuredWorkout.isCompleted}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors mt-3 ${
                    featuredWorkout.isCompleted
                      ? 'bg-[#00FF7F] text-[#1A1A1A] cursor-not-allowed'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
                  }`}
                >
                  {featuredWorkout.isCompleted ? '✓ 已完成' : '开始训练'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 训练列表 */}
        {otherWorkouts.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-3">
              {selectedCategory === 'all' ? '更多训练' : `${categoryMap[selectedCategory]}训练`}
            </h2>
            <div className="space-y-3">
              {otherWorkouts.map(workout => (
                <div 
                  key={workout.id} 
                  className="bg-[#2A2A2A] rounded-xl p-4 flex items-center gap-4 hover:bg-[#333] transition-colors"
                >
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${
                    workout.category === 'cardio' ? 'bg-[#0066FF] bg-opacity-20' :
                    workout.category === 'strength' ? 'bg-[#00FF7F] bg-opacity-20' :
                    'bg-[#FF6B35] bg-opacity-20'
                  }`}>
                    {workout.category === 'cardio' ? '🏃' : 
                     workout.category === 'strength' ? '💪' : '🧘'}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{workout.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#AAA]">
                      <span>⏱ {workout.duration} 分钟</span>
                      <span>•</span>
                      <span>🔥 {workout.calories} 千卡</span>
                      <span>•</span>
                      <span>{levelMap[workout.level]}</span>
                    </div>
                  </div>

                  {workout.isCompleted ? (
                    <div className="flex items-center gap-2 text-[#00FF7F] text-sm font-semibold">
                      <span>✓</span>
                      <span>已完成</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteWorkout(workout.id)}
                      className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0052CC] transition-colors"
                    >
                      开始
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏋️</div>
            <p className="text-[#AAA] text-lg mb-2">未找到训练</p>
            <p className="text-[#666] text-sm">试试选择其他分类</p>
          </div>
        )}
      </div>
    );
  };

  // 设备页面
  const DevicePage = () => {
    const primaryDevice = devices[0];
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState({
      name: '智能手表',
      type: 'watch',
      model: 'Pro X1'
    });

    const deviceTypeMap = {
      'watch': '⌚ 智能手表',
      'band': '🎯 运动手环',
      'tracker': '📍 活动追踪器',
      'scale': '⚖️ 智能体重秤'
    };

    const handleAddDevice = async (e) => {
      e.preventDefault();
      
      try {
        const serialNumber = `FW${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        await api.addDevice({
          ...newDevice,
          serialNumber
        });

        const updatedDevices = await api.getDevices();
        setDevices(updatedDevices);
        setShowAddModal(false);
        
        setNewDevice({
          name: '智能手表',
          type: 'watch',
          model: 'Pro X1'
        });
      } catch (error) {
        console.error('添加设备失败:', error);
        alert('添加设备失败: ' + (error.error || '未知错误'));
      }
    };

    return (
      <div className="p-6 pb-24">
        <h1 className="text-white text-2xl font-bold mb-8">我的设备</h1>

        {primaryDevice ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-full bg-[#222] border-2 border-[#444] flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-xl bg-[#111] border-2 border-[#0066FF] flex items-center justify-center">
                  <span className="text-white text-sm">
                    {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">{primaryDevice.name}</h2>
              <p className={`text-sm flex items-center gap-2 ${primaryDevice.isConnected ? 'text-[#00FF7F]' : 'text-[#FF6B35]'}`}>
                <span className={`w-2 h-2 rounded-full ${primaryDevice.isConnected ? 'bg-[#00FF7F]' : 'bg-[#FF6B35]'}`}></span>
                {primaryDevice.isConnected ? '已连接' : '未连接'}
              </p>
            </div>

            <div className="bg-[#2A2A2A] rounded-xl p-4 flex justify-between items-center mb-6">
              <span className="text-white font-semibold">电量</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-4 border-2 border-[#00FF7F] rounded-sm relative">
                  <div 
                    className="absolute left-0.5 top-0.5 h-2.5 bg-[#00FF7F] rounded-sm transition-all"
                    style={{ width: `${(primaryDevice.battery || 0) * 0.7}%` }}
                  ></div>
                </div>
                <span className="text-white font-semibold">{primaryDevice.battery || 0}%</span>
              </div>
            </div>

            <div>
              <h3 className="text-[#AAA] text-sm mb-3 uppercase tracking-wider">设置</h3>
              
              <div className="bg-[#2A2A2A] rounded-xl p-4 flex justify-between items-center mb-3">
                <span className="text-white">通知</span>
                <button
                  onClick={() => handleUpdateDevice(primaryDevice.id, { 
                    notificationsEnabled: !primaryDevice.notificationsEnabled 
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    primaryDevice.notificationsEnabled ? 'bg-[#0066FF]' : 'bg-[#444]'
                  } relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    primaryDevice.notificationsEnabled ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>

              <div className="bg-[#2A2A2A] rounded-xl p-4 flex justify-between items-center mb-3">
                <span className="text-white">自动同步</span>
                <button
                  onClick={() => handleUpdateDevice(primaryDevice.id, { 
                    autoSyncEnabled: !primaryDevice.autoSyncEnabled 
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    primaryDevice.autoSyncEnabled ? 'bg-[#0066FF]' : 'bg-[#444]'
                  } relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    primaryDevice.autoSyncEnabled ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>

              <div className="bg-[#2A2A2A] rounded-xl p-4 flex justify-between items-center mb-6">
                <span className="text-white">表盘</span>
                <span className="text-[#AAA]">数字 &gt;</span>
              </div>

              <button 
                onClick={() => {
                  if (confirm('确定要解除配对此设备吗？')) {
                    api.deleteDevice(primaryDevice.id).then(() => {
                      setDevices(devices.filter(d => d.id !== primaryDevice.id));
                    }).catch(error => {
                      alert('解除配对失败');
                    });
                  }
                }}
                className="w-full border-2 border-[#FF6B35] rounded-xl py-4 text-[#FF6B35] font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors"
              >
                解除配对
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-[#AAA] mt-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <Watch size={48} className="text-[#444]" />
            </div>
            <p className="text-lg mb-2">暂无设备</p>
            <p className="text-sm mb-6">连接您的健身设备开始追踪</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#0066FF] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0052CC] transition-colors"
            >
              添加设备
            </button>
          </div>
        )}

        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
          >
            <div className="bg-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold">添加新设备</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-[#AAA] hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddDevice} className="space-y-5">
                <div>
                  <label className="text-[#AAA] text-sm block mb-2 font-medium">设备名称</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="例如：智能手表"
                    className="w-full bg-[#1A1A1A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#AAA] text-sm block mb-2 font-medium">设备类型</label>
                  <div className="relative">
                    <select
                      value={newDevice.type}
                      onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                      className="w-full bg-[#1A1A1A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF] appearance-none cursor-pointer"
                    >
                      {Object.entries(deviceTypeMap).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAA]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 6l4 4 4-4H4z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[#AAA] text-sm block mb-2 font-medium">型号</label>
                  <input
                    type="text"
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    placeholder="例如：Pro X1"
                    className="w-full bg-[#1A1A1A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF] transition-all"
                    required
                  />
                </div>

                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333]">
                  <p className="text-[#AAA] text-xs mb-1">序列号</p>
                  <p className="text-white text-sm font-mono">自动生成</p>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-[#444] text-white py-3 rounded-xl font-semibold hover:bg-[#555] transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0066FF] text-white py-3 rounded-xl font-semibold hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
                  >
                    添加设备
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 个人资料页面
  const ProfilePage = () => {
    return (
      <div className="p-6 pb-24">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#333] rounded-full mb-4"></div>
          <h1 className="text-white text-xl font-bold">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-[#AAA] text-sm">
            {user?.isPremium ? '高级会员' : '免费会员'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <p className="text-white text-xl font-bold">{workouts.filter(w => w.isCompleted).length}</p>
            <p className="text-[#AAA] text-sm">训练</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{stats?.totalActiveMinutes ? Math.round(stats.totalActiveMinutes / 60 * 10) / 10 : 0}h</p>
            <p className="text-[#AAA] text-sm">时长</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{stats?.totalCalories ? (stats.totalCalories / 1000).toFixed(1) : 0}k</p>
            <p className="text-[#AAA] text-sm">卡路里</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: '个人资料', color: 'bg-[#0066FF]' },
            { title: '成就', color: 'bg-[#00FF7F]' },
            { title: '目标', color: 'bg-[#FF6B35]' },
            { title: '设置', color: 'bg-[#AAA]' }
          ].map((item, index) => (
            <button
              key={index}
              className="w-full bg-[#2A2A2A] rounded-xl p-4 flex items-center justify-between hover:bg-[#333] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 ${item.color} bg-opacity-20 rounded-lg`}></div>
                <span className="text-white font-semibold">{item.title}</span>
              </div>
              <span className="text-[#AAA]">&gt;</span>
            </button>
          ))}
          
          <button
            onClick={() => {
              if (confirm('确定要退出登录吗？')) {
                logout();
                window.location.reload();
              }
            }}
            className="w-full bg-[#FF6B35] bg-opacity-20 border border-[#FF6B35] rounded-xl p-4 text-[#FF6B35] font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  };

  const renderActivePage = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-lg">加载中...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'data': return <DataPage />;
      case 'train': return <TrainPage />;
      case 'device': return <DevicePage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="max-w-md mx-auto bg-[#1A1A1A] min-h-screen relative">
      <StatusBar />
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
        {renderActivePage()}
      </div>
      <NavigationBar />
    </div>
  );
};

// 登录页面组件
const LoginPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      window.location.reload();
    } catch (err) {
      setError(err.error || '认证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          健身<span className="text-[#0066FF]">应用</span>
        </h1>
        <p className="text-[#AAA] text-center mb-8">追踪您的健身之旅</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="名字"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
                required={!isLogin}
              />
              <input
                type="text"
                placeholder="姓氏"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
                required={!isLogin}
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
            required
          />
          
          <input
            type="password"
            placeholder="密码"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
            required
          />

          {error && (
            <div className="bg-[#FF6B35] bg-opacity-20 border border-[#FF6B35] text-[#FF6B35] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white py-3 rounded-xl font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50"
          >
            {loading ? '请稍候...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <p className="text-center text-[#AAA] mt-6">
          {isLogin ? "还没有账号？" : "已有账号？"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#0066FF] font-semibold hover:underline ml-1"
          >
            {isLogin ? '注册' : '登录'}
          </button>
        </p>

        <div className="mt-8 p-4 bg-[#2A2A2A] rounded-xl">
          <p className="text-[#AAA] text-sm mb-2">测试账号：</p>
          <p className="text-white text-sm">邮箱：test@fitness.com</p>
          <p className="text-white text-sm">密码：test123</p>
        </div>
      </div>
    </div>
  );
};

// 主入口
const App = () => {
  return (
    <AuthProvider>
      <FitnessApp />
    </AuthProvider>
  );
};

export default App;