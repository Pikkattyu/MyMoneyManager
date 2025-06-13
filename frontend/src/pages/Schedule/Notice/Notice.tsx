import React, { useEffect, useState } from 'react';

const Notice: React.FC = () => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [disNoticeLimits, setDisNoticeLimits] = useState<any[]>([]);
  const [disNoticeNoLimits, setDisNoticeNoLimits] = useState<any[]>([]);
  const [detailFlg, setDetailFlg] = useState<boolean>(false);
  const [disNotice, setDisNotice] = useState<any>();

  const [dataFlg, setDataFlg] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getNoticeDate', {
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

  const DetailOpen = (notice: any) => {
    setDetailFlg(true);
    setDisNotice(notice);
  };

  return (
    <div>
      <div className='errorMessage'>{errorMessages}</div>
      <div className="NoticeHeader">
        <div className='TagSwitcher'>
          <button onClick={() => setDataFlg(false)} className={!dataFlg ? 'active' : ''}>予定</button>
          <button onClick={() => setDataFlg(true)} className={dataFlg  ? 'active' : ''}>Todo</button>
        </div>
      </div>
      <div className="SettingScroll">
      {(dataFlg ? disNoticeNoLimits : disNoticeLimits).map((element, index) => (
        <div key={index} className="SettingScrollLine" onClick={() => DetailOpen(element)}>
          <div>{element.Title}</div>
        </div>
      ))}
      </div>

      {detailFlg &&(
        <>
          <div className='overlay' onClick={() => setDetailFlg(false)}></div>
          <div className='noticePopUp'>
            <div className='noticeTitle'>{disNotice.Title}</div>
            <div className="noticeTxt">
              {disNotice.Txt.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notice;