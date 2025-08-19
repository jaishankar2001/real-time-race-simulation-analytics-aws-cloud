import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [hasAccount, setHasAccount] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  console.log('Topic Creator URL:', process.env.REACT_APP_TOPIC_CREATOR_URL);
  console.log('User Check URL:', process.env.REACT_APP_USER_CHECK_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(process.env.REACT_APP_TOPIC_CREATOR_URL, {
        "user_id": username,
        "user_email": email,
        "password": password
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleNewFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(process.env.REACT_APP_USER_CHECK_URL, {
        "username": newUsername,
        "password": newPassword
      });
      alert('New form data submitted successfully!');
    } catch (error) {
      console.error('Error submitting new form data:', error);
    }
  };

  const handleRedirect = () => {
    navigate('/race-page');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Our App</h1>
      <div>
        <label>
          <input
            type="radio"
            name="formOption"
            checked={!showNewForm && !hasAccount}
            onChange={() => { setShowNewForm(false); setHasAccount(false); }}
          />
          I want to go the race
        </label>
        <label>
          <input
            type="radio"
            name="formOption"
            checked={hasAccount}
            onChange={() => { setShowNewForm(false); setHasAccount(true); }}
          />
          Create an account
        </label>
        <label>
          <input
            type="radio"
            name="formOption"
            checked={showNewForm}
            onChange={() => { setHasAccount(false); setShowNewForm(true); }}
          />
          Request connection kit
        </label>
      </div>

      {hasAccount && !showNewForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div>
            <label>
              Username:  
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Email:  
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label> 
              Password:  
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      )}

      {submitted && <p>Account details submitted successfully, please subscribe to emails before requesting for a connection kit!</p>}

      {showNewForm && (
        <form onSubmit={handleNewFormSubmit} style={{ marginTop: '20px' }}>
          <div>
            <label>
              Username:  
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Password:  
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Connection kit will be emailed to you</button>
        </form>
      )}

      <button onClick={handleRedirect} style={{ marginTop: '20px' }}>
        Go to RaceStream
      </button>
    </div>
  );
};

export default Homepage;
