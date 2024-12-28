import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () => {
    const [userID, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, password }),
        });

        if (response.ok) {
            const data = await response.json();

            // トークンをクッキーに保存
            localStorage.setItem('token', data.token);
            localStorage.setItem('userNo', data.userNo);
            localStorage.setItem('userName', data.userName);
            localStorage.setItem('bookID', data.bookID);

            navigate('/home');

            // ページを再読み込みする
            window.location.reload();
        } else {
            // エラーハンドリング
        }
    };

    const handleRegister = () => {
        navigate('/register'); // Register ページに遷移する
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={userID}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Login</button>
            <button type="button" onClick={handleRegister}>Register</button>
        </form>
    );
};

export default Login;
