import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, index: number, Name: string) => void;
}

const DisCategory: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [disWorks, setDisWorks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getworkall', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const work = data.work;

        if (work){
          setDisWorks(work);
        }else{
          setDisWorks([]);
        }
        
      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            error.message,
          ]);
        } else {
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            '予期しないエラーが発生しました。',
          ]);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>案件表示</h1>
      <div className='Category'>
        {disWorks.map((work) => (
          <div key={work.WorkID} className='Work-container' onClick={() => onClose(2, work.WorkID, work.WorkName)}>
            <div className='Work-item'>
              <span className='Work-contents'>{work.WorkName}</span>
              <span className='Work-contents'>{work.WorkType}</span>
              <span className='Work-contents'>{work.PayType}</span>
              <span className='Work-contents'>{work.Salary}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => onClose(3, 0, "")} className='btn-style'>新規作成</button>
        <button onClick={() => onClose(0, 0, "未選択")} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default DisCategory;