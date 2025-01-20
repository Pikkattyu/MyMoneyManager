import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean, number: number, index: number) => void;
  AssetsID: number;
}

const CreateAssets: React.FC<OpenButtonProps> = ({ onClose, AssetsID }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // 状態変数を追加
  const [tag, setTag] = useState<string>('');
  const [assetsName, setAssetsName] = useState<string>('');
  const [userNo, setUserNo] = useState<number>(-1);
  const [Amount, setAmount] = useState<number>(0);
  const [Excluded, setIsExcluded] = useState<boolean>(false);
  const [flg, setFlg] = useState<number>(0);
  const [UpdateTime, setUpdateTime] = useState<string>("");

  const [getUsersData, setUsersData] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getassets?AssetsID=' + AssetsID, {
          method: 'GET',
        });

        if (!response.ok) {
          console.log(response.json)
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const assets = data.data;

        setTag(assets.Tag)
        setAssetsName(assets.AssetsName)
        setUserNo(assets.UserNo)
        setAmount(assets.Amount)
        setIsExcluded(assets.Excluded)
        setFlg(assets.Flg)
        setUpdateTime(assets.UpdateTime)
        /*setUpdateTime(new Date(assets.UpdateTime).toISOString())*/

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
  }, []);

  const handleChange = async () => {
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
      const response = await fetch('/api/changeassets', {
        method: 'POST',
        body: JSON.stringify({ tag, assetsName, AssetsID, flg, userNo, Amount, Excluded, UpdateTime }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessages([result?.errorMessage]);
      } else {
        onClose(true, 1, AssetsID);
      }
    } catch (error) {
      setErrorMessages(["例外エラーが発生しました。"]);
    }
  };

  return (
    <div className='PopUp'>
      <h1>資産変更</h1>

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
        <button onClick={handleChange} className='btn-style'>更新</button>
        <button onClick={() => onClose(false, 1, 0)} className='btn-style'>閉じる</button>
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

export default CreateAssets;