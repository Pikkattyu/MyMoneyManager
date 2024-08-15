import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({ userId, username, email, password }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userNo', data.userNo);
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('bookID', data.bookID);
                navigate('/home')
            } else {
                setMessage(data.message || '作成中にエラーが発生しました。');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Register</button>
            <p>{message}</p>
        </form>
    );
}

export default RegisterForm;