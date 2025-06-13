import React, { useEffect, useState } from 'react';
import IconModal from "../Modal/IconModal"
import '../../../styles.css'; // CSSファイルのインポート

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
  const [disAmount, setDisAmount] = useState<string>('0');
  const [Excluded, setIsExcluded] = useState<boolean>(false);
  const [flg, setFlg] = useState<number>(0);
  const [UpdateTime, setUpdateTime] = useState<string>("");

  const [getUsersData, setUsersData] = useState<any[]>([]);

  const [isIconFlg, setIconFlg] = useState<boolean>(false);
  const [disColorCode, setColorCode] = useState<string>("#eeeeee");
  const [disColor, setColor] = useState<string>("#eeeeee");
  const [disIconPath, setIconPath] = useState<string>("");

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
        setUsersData(data.users);

        setTag(assets.Tag)
        setAssetsName(assets.AssetsName)
        setUserNo(assets.UserNo)
        NumberCheck(assets.Amount.toString())
        setIsExcluded(assets.Excluded)
        setFlg(assets.Flg)
        setUpdateTime(assets.UpdateTime)
        setColor(assets.Backgroundcolor)
        setColorCode(assets.Backgroundcolor)
        setIconPath(assets.IconPath)
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
        body: JSON.stringify({ 
          tag, 
          assetsName, 
          AssetsID, 
          flg, 
          userNo, 
          Amount, 
          Excluded, 
          UpdateTime,
          Backgroundcolor:disColor,
          IconPath:disIconPath 
        }),
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

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/deleteassets', {
        method: 'POST',
        body: JSON.stringify({ AssetsID }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessages([result?.errorMessage]);
      } else {
        onClose(false, 1, 0);
      }
    } catch (error) {
      setErrorMessages(["例外エラーが発生しました。"]);
    }
  };

  const NumberCheck = (e: string) => {
    let inputValue = e;

    // **全角数字を半角に変換**
    inputValue = inputValue.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

    // **数字のみを抽出（非数字を削除）**
    inputValue = inputValue.replace(/[^0-9]/g, "");

    // **先頭のゼロを削除**
    if (inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // **カンマ区切りに変換**
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setAmount(parseInt(inputValue));
    setDisAmount(formattedValue);
  };
  
  const SelectFilePath = (filePath:string) => {
    if(filePath == "null"){
      //閉じる
    }else{
      setIconPath(filePath)
    }
    setIconFlg(false)
  }

  const ColorCheck = (e: string) => {
    let inputValue = e.trim(); // 空白を削除
  
    // **全角英数字を半角に変換**
    inputValue = inputValue.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
  
    // **カラーコード以外の文字を削除（# を先頭に許可）**
    inputValue = inputValue.replace(/[^#0-9A-Fa-f]/g, "");
  
    // **# を追加（先頭になければ）**
    if (!inputValue.startsWith("#")) {
      inputValue = "#" + inputValue;
    }
  
    //表示するカラーコード
    setColorCode(inputValue);

    // **6桁 or 3桁のカラーコードに制限**
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(inputValue)) {
      return; // 不正な場合はセットしない
    }
    //表示するカラー
    setColor(inputValue);
  };

  const handleFileChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return alert("ファイルを選択してください");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("path", "public/Icons")

    try {
      const response = await fetch("/api/uploadfilepath", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setIconPath("public" + data.filePath.replace(/\/\//g, "/"));
    } catch (error) {
      console.error("アップロード失敗", error);
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
          value={disAmount}
          onChange={(e) => NumberCheck(e.target.value)}
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

      <div className="inputGroup">
        <span className="label">カラー</span>
        <div className="SubGroup">
          <input
            type="text"
            className="category-name-input"
            value={disColorCode}
            onChange={(e) => ColorCheck(e.target.value)}
            placeholder="カラーコードを入力してください"
          />
        </div>
      </div>
      <div className="inputGroup">
        <span className="label">アイコン設定</span>
        <div className="category-Image-box" style={{ backgroundColor: disColor }}>
          {disIconPath !== "" &&(
            <img className='category-Image' src={disIconPath} alt="画像の説明" width="30"/>
          )}
        </div>
        <div className='category-Image-ButtonBox'>
          <label>
            画像登録
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>
        <div className='category-Image-ButtonBox'>
          <button onClick={() => setIconFlg(true)}>アイコン</button>
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={handleChange} className='btn-style'>更新</button>
        <button onClick={handleDelete} className='btn-style'>削除</button>
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

      {isIconFlg &&(
        <>
          <div className='overlay'  onClick={() => setIconFlg(false)}>
          </div>
          <IconModal
            onSelect={SelectFilePath}
            disColor={disColor}>
          </IconModal>
        </>
      )}
    </div>
  );
};

export default CreateAssets;