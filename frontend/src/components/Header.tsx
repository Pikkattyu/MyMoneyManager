import React from 'react';
import '../styles.css'; // CSSファイルのインポート

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>お小遣い帳</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">News</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Access</a></li>
          <li><a href="#">Blog</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;