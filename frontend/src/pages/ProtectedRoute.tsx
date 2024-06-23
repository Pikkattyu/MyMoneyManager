import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false); // トークンがない場合もローディングを終了
            return;
        }

        fetch('/api/authcheck', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }).then(response => {
            if (response.ok) {
                setLoading(false); // データの取得が成功した場合もローディングを終了
            } else {
                localStorage.removeItem('token'); // ログインエラー時はトークンを削除
                setLoading(false); // ローディングを終了
            }
        }).catch(() => {
            localStorage.removeItem('token'); // エラー時もトークンを削除
            setLoading(false); // ローディングを終了
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>; // ローディング中は表示する内容
    }

    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />; // ログインが必要な場合はリダイレクト
    }

    return <>{children}</>; // ログイン済みであれば子コンポーネントを表示
};

export default ProtectedRoute;
