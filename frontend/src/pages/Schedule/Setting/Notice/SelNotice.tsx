import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, noticeID:number, flg: boolean) => void;
  flg: boolean
}

const DisCategory: React.FC<OpenButtonProps> = ({ onClose, flg }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [disNoticeLimits, setDisNoticeLimits] = useState<any[]>([]);
  const [disNoticeNoLimits, setDisNoticeNoLimits] = useState<any[]>([]);
  const [dataFlg, setDataFlg] = useState<boolean>(flg);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getNoticeAll', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const notices = data.notice;

        if(notices){
          const limits:any = [];
          const noLimits:any = [];
          notices.forEach(notice => {
            if(notice.DateStart === "" && notice.DateEnd === ""){
              noLimits.push(notice);
            }else{
              limits.push(notice);
            }
          });
          setDisNoticeLimits(limits)
          setDisNoticeNoLimits(noLimits);
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
      <h1>お知らせ表示</h1>
        <div className='TagSwitcher'>
          <button onClick={() => setDataFlg(false)} className={!dataFlg ? 'active' : ''}>予定</button>
          <button onClick={() => setDataFlg(true)} className={dataFlg  ? 'active' : ''}>Todo</button>
        </div>
      <div className='Category'>
        {(dataFlg ? disNoticeNoLimits : disNoticeLimits).map((notice) => (
          <div key={notice.NoticeID} className='CategoryGroup' onClick={() => onClose(2, notice.NoticeID, dataFlg)}>
            <span className='Categorylabel'>{notice.Title}</span>
          </div>
        ))}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => onClose(3, 0, dataFlg)} className='btn-style'>新規作成</button>
        <button onClick={() => onClose(0, 0, dataFlg)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default DisCategory;