import axios from 'axios'

// Create axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:4000/api/v1",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to automatically add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // Add token to headers if it exists
    if (token) {
      try {
        // Parse token if it's stored as JSON string
        const tokenValue = JSON.parse(token)
        config.headers.Authorization = `Bearer ${tokenValue}`
      } catch (e) {
        // If parsing fails, use token as is
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiConnector = (method , url , bodyData, headers, params)=>{
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData: null, 
        headers: headers ? headers: null, 
        params: params ? params: null, 
    })
}
