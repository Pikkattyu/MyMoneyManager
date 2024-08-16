import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
}

const AssetsSetting: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // 状態変数を追加
  const [tag, setTag] = useState<string>('');
  const [assetsName, setAssetsName] = useState<string>('');
  const [userNo, setUserNo] = useState<number>(-1);
  const [Amount, setAmount] = useState<number>(0);
  const [Excluded, setIsExcluded] = useState<boolean>(false);
  const [flg, setFlg] = useState<number>(0);

  const [getUsersData, setUsersData] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getuserassets', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        setUsersData(data.data);
      } catch (error) {
        // 'error'がError型であることを確認し、エラーメッセージを取得する
        if (error instanceof Error) {
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            error.message,
          ]);
        } else {
          // 'error'がError型でない場合、デフォルトのメッセージを設定する
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            '予期しないエラーが発生しました。',
          ]);
        }
      }
    };

    fetchData();

    // ローカルストレージからのデータ取得
    const UserNo = localStorage.getItem('userNo') || '';
    setUserNo(Number(UserNo));

  }, []);

  const handleCreate = async () => {
    setErrorMessages([]);

    let cnt = 0;
    if (tag === '') {
      setErrorMessages((prevMessages) => [
        ...prevMessages,
        '※タグを入力してください',
      ]);
      cnt++;
    }

    if (assetsName === '') {
      setErrorMessages((prevMessages) => [
        ...prevMessages,
        '※名前を入力してください',
      ]);
      cnt++;
    }

    if (userNo === -1) {
      setErrorMessages((prevMessages) => [
        ...prevMessages,
        '※所有者を選択してください',
      ]);
      cnt++;
    }

    if (Amount < 0) {
      setErrorMessages((prevMessages) => [
        ...prevMessages,
        '初期残高を入力してください',
      ]);
      cnt++;
    }

    if (cnt > 0) {
      return;
    }

    try {
      const response = await fetch('/api/assetsregister', {
        method: 'POST',
        body: JSON.stringify({ tag, assetsName, flg, userNo, Amount, Excluded }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessages([result?.errorMessage]);
      } else {
        onClose(true);
      }
    } catch (error) {
      setErrorMessages(["例外エラーが発生しました。"]);
    }
  };

  return (
    <div className='PopUp'>
      <h1>新規作成</h1>

      <div className='inputGroup'>
        <span className='label'>タグ</span>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="タグを入力してください"
          className='input'
        />
      </div>

      <div className='inputGroup'>
        <span className='label'>名前</span>
        <input
          type="text"
          value={assetsName}
          onChange={(e) => setAssetsName(e.target.value)}
          placeholder="名前を入力してください"
          className='input'
        />
      </div>

      <div className='inputGroup'>
        <span className='label'>資産 / 負債</span>
        <select
          value={flg}
          onChange={(e) => setFlg(Number(e.target.value))}
          className='input'
        >
          <option value={0}>資産</option>
          <option value={1}>負債</option>
        </select>
      </div>

      <div className='inputGroup'>
        <span className='label'>所有者</span>
        <select
          value={userNo}
          onChange={(e) => setUserNo(Number(e.target.value))}
          className='input'
        >
          <option value={-1}>所有者を選択</option>
          {getUsersData.map((user) => (
            <option key={user.UserNo} value={user.UserNo}>
              {user.UserName}
            </option>
          ))}
        </select>
      </div>

      <div className='inputGroup'>
        <span className='label'>初期残高</span>
        <input
          type="number"
          value={Amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="初期残高を入力してください"
          className='input'
        />
      </div>

      <div className='inputGroup'>
        <span className='label'>資産非計上</span>
        <input
          type="checkbox"
          checked={Excluded}
          onChange={(e) => setIsExcluded(e.target.checked)}
          className='input'
        />
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={handleCreate} className='btn-style'>作成</button>
        <button onClick={() => onClose(false)} className='btn-style'>キャンセル</button>
      </div>

      {errorMessages.length > 0 && (
        <div>
          <span className='errorMessageHeader'>エラーがあります。</span>
          <span className='errorMessage'>
            {errorMessages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export default AssetsSetting;