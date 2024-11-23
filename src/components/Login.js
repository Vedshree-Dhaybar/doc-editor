import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
          const response = await axios.post('http://localhost:5000/api/login', {
              email,
              password
          });

          setMessage(response.data.message);
          localStorage.setItem('token', response.data.token);

          // Redirect to the TextEditor
          navigate('/documents/:id');
          
      } catch (error) {
          setMessage(error.response?.data?.message || 'An error occurred');
      }
  };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Login</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                <h4>Don't have an Account? <Link to="/register">Register</Link></h4>
            </form>
        </div>
    );
};

export default Login;
