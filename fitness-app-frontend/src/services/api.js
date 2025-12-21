import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://fitnee-backend.onrender.com/api'
  : 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器:自动添加 token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器:处理错误
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // ========== 认证 ==========
  async register(userData) {
    const data = await this.api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async login(credentials) {
    const data = await this.api.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getMe() {
    return this.api.get('/auth/me');
  }

  // ========== 用户 ==========
  async getProfile() {
    return this.api.get('/users/profile');
  }

  async updateProfile(profileData) {
    return this.api.put('/users/profile', profileData);
  }

  async updateUser(userData) {
    return this.api.put('/users/me', userData);
  }

  // ========== 活动 ==========
  async getTodayActivity() {
    return this.api.get('/activities/today');
  }

  async updateActivity(activityData) {
    return this.api.put('/activities/today', activityData);
  }

  async getWeeklyActivity() {
    return this.api.get('/activities/weekly');
  }

  async getActivityStats() {
    return this.api.get('/activities/stats');
  }

  // ========== 训练 ==========
  async getWorkouts(filters = {}) {
    return this.api.get('/workouts', { params: filters });
  }

  async getWorkoutById(id) {
    return this.api.get(`/workouts/${id}`);
  }

  async createWorkout(workoutData) {
    return this.api.post('/workouts', workoutData);
  }

  async completeWorkout(id) {
    return this.api.put(`/workouts/${id}/complete`);
  }

  async deleteWorkout(id) {
    return this.api.delete(`/workouts/${id}`);
  }

  // ========== 设备 ==========
  async getDevices() {
    return this.api.get('/devices');
  }

  async getDeviceById(id) {
    return this.api.get(`/devices/${id}`);
  }

  async addDevice(deviceData) {
    return this.api.post('/devices', deviceData);
  }

  async updateDevice(id, updates) {
    return this.api.put(`/devices/${id}`, updates);
  }

  async syncDevice(id) {
    return this.api.post(`/devices/${id}/sync`);
  }

  async deleteDevice(id) {
    return this.api.delete(`/devices/${id}`);
  }
}

export default new ApiService();