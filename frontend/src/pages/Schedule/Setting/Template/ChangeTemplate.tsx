import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート
import CreateCalendarModal from './Modal/CreateCalendar';
import ChangeCalendarModal from './Modal/ChangeCalendar';

interface OpenButtonProps {
  onClose: (number: number, index: number) => void;
  TemplateID: number;
}

const ChangeTemplate: React.FC<OpenButtonProps> = ({ onClose, TemplateID }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [disTemplateInfo, setTemplateInfo] = useState<any[]>([]);
  const [disTemplate, setDisTemplate] = useState<string>("");
    const [disRemarks, setRemarks] = useState<string>("");
  
  const [disColorCode, setColorCode] = useState<string>("#eeeeee");
  const [disColor, setColor] = useState<string>("#eeeeee");

  const [disTemplateInfoData, setTemplateInfoData] = useState<any>();
  const [isCreateFlg, setCreateFlg] = useState<boolean>(false);
  const [isChangeFlg, setChangeFlg] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getTemplate?TemplateID=' + TemplateID, {
          method: 'GET',
        });

        if (!response.ok) {
          console.log(response.json)
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const TempInfos = data.data;

        const Title = TempInfos[0].TemplateName;
        const color = TempInfos[0].Backgroundcolor;
        const tempInfomaitons: any[] = [];

        TempInfos.forEach((TempInfo: any) => {
          tempInfomaitons.push({
            UpdateFlg: 0,
            TemplateInfomationID:TempInfo.TemplateInfomationID,
            Title: TempInfo.Title, 
            StartDateTime: TempInfo.StartTime, 
            EndDateTime: TempInfo.EndTime, 
            IncomeFlg: TempInfo.IncomeFlg, 
            ViewFlg: TempInfo.ViewFlg, 
            Category: TempInfo.CategoryName, 
            CategoryID: TempInfo.CategoryID, 
            Subcategory: TempInfo.SubcategoryName, 
            SubcategoryID: TempInfo.SubcategoryID, 
            WorkID: TempInfo.WorkID, 
            WorkName: TempInfo.WorkName, 
            Remarks: TempInfo.temp_remarks, 
            Color: TempInfo.temp_backgroundcolor
          });
        });

        tempInfomaitons.push({
          UpdateFlg: 0,
          TemplateInfomationID:0,
          Title:"+",
          Category:"",
          CategoryID:0,
          Subcategory:"",
          SubcategoryID:0,
          WorkID:0,
          Remarks:"",
          Color:"eee",
          StartDateTime:"",
          EndDateTime:"",
          ViewFlg:false,
          IncomeFlg:0
        });

        setTemplateInfo(tempInfomaitons);
        console.log(tempInfomaitons);
        setDisTemplate(Title);
        setColor(color)
        setColorCode(color)

      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
  }, [TemplateID]);

  const EditSubTemplate = (tempInfo) => {
    setTemplateInfoData(tempInfo);
    if(tempInfo.Title === "+"){
      setCreateFlg(true);
    }else{
      setChangeFlg(true);
    }
  };

  const CloseCreateTemplateInfo = (TempInfo) => {
    setCreateFlg(false);
    if(TempInfo === null){
      return;
    }
    
    const updatedTemplateInfos = SetTemplateInfomation(TempInfo, 2);

    const newTemplateInfo = {
      UpdateFlg: 0,
      TemplateInfomationID: Math.max(...updatedTemplateInfos.map(info => info.TemplateInfomationID), 10) + 1, // 最大値+1
      Title:"+",
      Category:"",
      CategoryID:0,
      Subcategory:"",
      SubcategoryID:0,
      WorkID:0,
      Remarks:"",
      Color:"eee",
      StartDateTime:"",
      EndDateTime:"",
      ViewFlg:false,
      IncomeFlg:0
    };
    updatedTemplateInfos.push(newTemplateInfo);
    setTemplateInfo(updatedTemplateInfos);
  };
  
  const CloseChangeTemplateInfo = (TempInfo) => {
    setChangeFlg(false);
    if(TempInfo === null){
      return;
    }

    //削除の場合
    if(TempInfo === true){
      const updatedTemplateInfos = SetTemplateInfomation(TempInfo, 3);
      setTemplateInfo(updatedTemplateInfos);
      return;
    }

    const updatedTemplateInfos = SetTemplateInfomation(TempInfo, 1);
    setTemplateInfo(updatedTemplateInfos);
  };

  const SetTemplateInfomation = (TempInfo, index:number) => {
    const updatedTemplateInfos = disTemplateInfo.map(subcate =>
      subcate.TemplateInfomationID === disTemplateInfoData.TemplateInfomationID
        ? { ...subcate, 
          Title: TempInfo.Title, 
          StartDateTime: TempInfo.StartDateTime, 
          EndDateTime: TempInfo.EndDateTime, 
          IncomeFlg: TempInfo.IncomeFlg, 
          ViewFlg: TempInfo.ViewFlg, 
          Category: TempInfo.Category, 
          CategoryID: TempInfo.CategoryID, 
          Subcategory: TempInfo.Subcategory, 
          SubcategoryID: TempInfo.SubcategoryID, 
          WorkID: TempInfo.WorkID,
          WorkName: TempInfo.WorkName,
          Remarks: TempInfo.Remarks, 
          Color: TempInfo.Color,
          UpdateFlg: index
        }
        : subcate
    );

    const sortedDisTemplateInfo = [...updatedTemplateInfos].sort((a, b) => {
      const timeA = a.StartDateTime || "99:99"; // 空文字は最後にする
      const timeB = b.StartDateTime || "99:99";
      return timeA.localeCompare(timeB);
    });
    return sortedDisTemplateInfo;
  }

  const SaveTemplateData = async () => {
    if (disTemplate == "") {
      setErrorMessages('カテゴリ名が空のため、登録できません。');
      return;
    }
    try {
      const response = await fetch('/api/changeTemplate', {
        method: 'POST',
        body: JSON.stringify({ 
          TemplateID, 
          TemplateName:disTemplate, 
          Backgroundcolor:disColor,
          Remarks:disRemarks,
          disTemplateInfomation:disTemplateInfo,
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

  const DelTemplateData = async () => {
    try {
      const response = await fetch('/api/delTemplate', {
        method: 'POST',
        body: JSON.stringify({ 
          TemplateID, 
          Delflg:true
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

  return (
    <div className='PopUp'>
      <h1>カテゴリ編集</h1>

      <div className='Category'>
        <div className="category-container">
          <span className="category-label">名前:</span>
          <input
            type="text"
            className="category-name-input"
            value={disTemplate}
            onChange={(e) => setDisTemplate(e.target.value)}
            placeholder="カテゴリ名を入力してください"
          />
        </div>
        <div>
          <div><span>サブカテゴリ</span></div>
          <div className='SubTempGroup'>
            {disTemplateInfo.map((tempInfo) => (
              <div key={'ChangeTemplate' + tempInfo.TemplateInfomationID} className='TempDiv' onClick={() => EditSubTemplate(tempInfo)}>
                <span className='TempSpan'>{tempInfo.Title}</span>
                {tempInfo.StartDateTime !== "" &&(
                  <>
                    <span className='TempSpan'>{tempInfo.StartDateTime}～{tempInfo.EndDateTime}</span>
                    <span className='TempSpan'>{tempInfo.Category} {tempInfo.Subcategory}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="category-container">
          <span className="category-label">カラー</span>
          <input
            type="text"
            className="category-name-input"
            value={disColorCode}
            onChange={(e) => ColorCheck(e.target.value)}
            placeholder="カラーコードを入力してください"
          />
        </div>

        <div className='TransactionMemoLabel'>
          <textarea className='TransactionMemo' value={disRemarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveTemplateData()} className='btn-style'>登録</button>
        <button onClick={() => DelTemplateData()} className='btn-style'>削除</button>
        <button onClick={() => onClose(1, 0)} className='btn-style'>閉じる</button>
      </div>
      <div>
        <span>{errorMessages}</span>
      </div>

      {isCreateFlg && (
        <>
          <CreateCalendarModal 
            onClose={CloseCreateTemplateInfo}
          />
        </>
      )}

      {isChangeFlg && (
        <>
          <ChangeCalendarModal 
            onClose={CloseChangeTemplateInfo}
            TemplateInfo={disTemplateInfoData}
          />
        </>
      )}
    </div>
  );
};

export default ChangeTemplate;