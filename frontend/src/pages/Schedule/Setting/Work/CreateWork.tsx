import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, index: number) => void;
}

type PayType = '日給' | '月給' | '単価';
type WorkType = '本業' | '副業';

const CreateWork: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [disWork, setDisWork] = useState<string>("");
  const [workSelected, setWorkSelected] = useState<WorkType>('本業'); 
  const [paySelected, setPaySelected] = useState<PayType>('日給'); 
  const [disSalary, setDisSalary] = useState<string>('0'); 
  const [Salary, setSalary] = useState<number>(0); 
  const [disCompany, setDisCompany] = useState<string>("");
  const [disAgent, setDisAgent] = useState<string>("");
  const [disRemarks, setDisRemarks] = useState<string>("");

  useEffect(() => {

  }, []);

  const SaveWorkData = async () => {
    if (disWork == "") {
      setErrorMessages('案件名が空のため、登録できません。');
      return;
    }
    if (disCompany == "") {
      setErrorMessages('会社名が空のため、登録できません。');
      return;
    }
    if (disCompany == "") {
      setErrorMessages('会社名が空のため、登録できません。');
      return;
    }

    try {
      const response = await fetch('/api/creatework', {
        method: 'POST',
        body: JSON.stringify({ 
          WorkName:disWork, 
          WorkType:workSelected,
          PayType:paySelected,
          Salary:Salary,
          Company:disCompany,
          Agent:disAgent,
          Remarks:disRemarks,
         }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      } else {
        onClose(1, 0)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  }

  const PayTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaySelected(e.target.value as PayType);
  };

  const WorkTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkSelected(e.target.value as WorkType);
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

    if (inputValue === "") {
      inputValue = "0";
    }

    // **カンマ区切りに変換**
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setSalary(parseInt(inputValue));
    setDisSalary(formattedValue);
  };

  return (
    <div className='PopUp'>
      <h1>案件登録</h1>

      <div className='Workboard'>
        <div className="category-container">
          <span className="category-label">案件名:</span>
          <input
            type="text"
            className="category-name-input"
            value={disWork}
            onChange={(e) => setDisWork(e.target.value)}
            placeholder="案件名を入力してください"
          />
        </div>

        
        <div className="category-container">
          <span className="category-label">仕事タイプ:</span>
          <label>
            <input
              type="radio"
              value="本業"
              checked={workSelected === '本業'}
              onChange={WorkTypeChange}
            />
            本業
          </label>
          <label>
            <input
              type="radio"
              value="副業"
              checked={workSelected === '副業'}
              onChange={WorkTypeChange}
            />
            副業
          </label>
        </div>

        <div className="category-container">
          <span className="category-label">給与:</span>
          <label>
            <input
              type="radio"
              value="日給"
              checked={paySelected === '日給'}
              onChange={PayTypeChange}
            />
            日給
          </label>
          <label>
            <input
              type="radio"
              value="月給"
              checked={paySelected === '月給'}
              onChange={PayTypeChange}
            />
            月給
          </label>
          <label>
            <input
              type="radio"
              value="単価"
              checked={paySelected === '単価'}
              onChange={PayTypeChange}
            />
            単価
          </label>
        </div>

        <div className="category-container">
          <span className="category-label">{paySelected}:</span>
          <input
            type="text"
            className="category-name-input"
            value={disSalary}
            onChange={(e) => NumberCheck(e.target.value)}
            placeholder={`${paySelected}を入力してください`}
          />
        </div>

        <div className="category-container">
          <span className="category-label">会社名:</span>
          <input
            type="text"
            className="category-name-input"
            value={disCompany}
            onChange={(e) => setDisCompany(e.target.value)}
            placeholder="会社名を入力してください"
          />
        </div>

        <div className="category-container">
          <span className="category-label">エージェント:</span>
          <input
            type="text"
            className="category-name-input"
            value={disAgent}
            onChange={(e) => setDisAgent(e.target.value)}
            placeholder="エージェント名を入力してください"
          />
        </div>

        <div className="category-container">
          <span className="category-label">備考:</span>
          <textarea
            className="category-name-input"
            value={disRemarks}
            onChange={(e) => setDisRemarks(e.target.value)}
          />
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveWorkData()} className='btn-style'>登録</button>
        <button onClick={() => onClose(1, 0)} className='btn-style'>閉じる</button>
      </div>
      <div>
        <span>{errorMessages}</span>
      </div>
    </div>
  );
};

export default CreateWork;