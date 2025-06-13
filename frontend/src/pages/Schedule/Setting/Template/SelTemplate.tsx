import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, index:number) => void;
  flg:boolean;
}

interface TemplateInfo {
  TemplateID: number;
  TemplateName: string;
}

const DisTemplate: React.FC<OpenButtonProps> = ({ onClose, flg }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [hozTemplateInfo, setHozTemplateInfo] = useState<any[]>([]);
  

  const [disTemplateInfo, setDisTemplateInfo] = useState<any[][]>([]);
  const [disTemplate, setDisTemplate] = useState<TemplateInfo[]>([]);

  const [isModalFlg, setModalFlg] = useState<boolean>(false);
  const [hozTemplate, setHozTemplate] = useState<TemplateInfo>();

  const getToday = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [disInDate, setInDate] = useState<string>(getToday());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getTemplateAll', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const template = data.data;

        if(!template){
          return;
        }

        let TemplateID = -1;
        let index = -1;
        const TemplateName: TemplateInfo[] = [];
        const tempInfoName: any[][] = [];

        template.forEach((cate: any) => {
          if (cate.TemplateInfoName === ""){
            cate.TemplateInfoName = "+"
          }
          if (TemplateID !== cate.TemplateID) {
            TemplateID = cate.TemplateID;
            TemplateName.push({
              TemplateID: cate.TemplateID,
              TemplateName: cate.TemplateName
            });
            tempInfoName.push([cate]);
            index++;
          } else {
            tempInfoName[index].push(cate);
          }
        });

        setHozTemplateInfo(template);
        setDisTemplateInfo(tempInfoName);
        setDisTemplate(TemplateName);
        
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

  const ModalOpen = (template) => {
    setHozTemplate(template);
    setModalFlg(true);
  }

  const onTemplate = async () => {
    const setTemplateInfos:any = [];
    hozTemplateInfo.forEach(tempInfo => {
      if(tempInfo.TemplateID === hozTemplate?.TemplateID){
        setTemplateInfos.push({ 
          Title:tempInfo.Title,
          StartDateTime: `${disInDate}T${tempInfo.StartTime}:00.000Z`,
          EndDateTime: `${disInDate}T${tempInfo.EndTime}:00.000Z`,
          IncomeFlg: tempInfo.IncomeFlg,
          ViewFlg: tempInfo.ViewFlg,
          Category: tempInfo.CategoryName,
          CategoryID: tempInfo.CategoryID,
          Subcategory: tempInfo.SubcategoryName,
          SubcategoryID: tempInfo.SubcategoryID,
          WorkID: tempInfo.WorkID,
          Remarks: tempInfo.Remarks 
        });

      }
    });

    try {
      const response = await fetch('/api/setTemplate', {
        method: 'POST',
        body: JSON.stringify(setTemplateInfos),
      });

      if (!response.ok) {
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      }
      onClose(2, hozTemplate?.TemplateID || 0)
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
  }

  return (
    <div>
      <h1>テンプレ表示</h1>
      <div className='Category'>
        {flg ? (
          <>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>日付</span>
              <input
                className='TransactionValueTime'
                type="date"
                value={disInDate}
                onChange={(e) => setInDate(e.target.value.toString())}
              />
            </div>
            {disTemplate.map((category, index) => (
              <div key={category.TemplateID} className='CategoryGroup' onClick={() => ModalOpen(category)}>
                <div>
                  <span className='Categorylabel'>{category.TemplateName}</span>
                </div>
                <div className='SubGroup'>
                  {(disTemplateInfo[index]).map((tempInfo, subIndex) => (
                    <span key={subIndex} className='Categoryspan'>{tempInfo.Title}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
          {disTemplate.map((category, index) => (
            <div key={category.TemplateID} className='CategoryGroup' onClick={() => onClose(2, category.TemplateID)}>
              <div>
                <span className='Categorylabel'>{category.TemplateName}</span>
              </div>
              <div className='SubGroup'>
                {(disTemplateInfo[index]).map((tempInfo, subIndex) => (
                  <span key={subIndex} className='Categoryspan'>{tempInfo.Title}</span>
                ))}
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => onClose(3, 0)} className='btn-style'>新規作成</button>
        <button onClick={() => onClose(0, 0)} className='btn-style'>閉じる</button>
      </div>

      {isModalFlg &&(
        <div className='PopUp'>
          <div className='Category'>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>日付：{disInDate}</span>
            </div>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>使用するテンプレート：{hozTemplate?.TemplateName}</span>
            </div>
            <div className='PopUpButtonGroup'>
              <button onClick={() => onTemplate()} className='btn-style'>適応</button>
              <button onClick={() => setModalFlg(false)} className='btn-style'>戻る</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisTemplate;