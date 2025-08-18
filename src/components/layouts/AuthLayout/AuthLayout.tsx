import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthLayout.scss"
import ui from "@/components/ui";

interface LoginFormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}
const AuthLayout = (): React.ReactElement => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, ] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login submitted:', formData);
      // Here you can handle the successful login (e.g., redirecting the user)
      // Redirect to studentPage
      navigate('/');

    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Login</h1>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <ui.Label 
              htmlFor="username" 
              required
              className="form-label"
            >
              Username
            </ui.Label>
            <ui.Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              placeholder="Enter your username"
              size="large"
              fullWidth
            />
          </div>

          <div className="form-group">
            <ui.Label 
              htmlFor="password" 
              required
              className="form-label"
            >
              Password
            </ui.Label>
            <ui.Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Enter your password"
              size="large"
              fullWidth
            />
          </div>

          <div className="form-submit">
            <ui.Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            >
              Login
            </ui.Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthLayout;