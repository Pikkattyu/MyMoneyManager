import React, { useEffect, useState } from 'react';
import '../../../../../styles.css'; // CSSファイルのインポート
import CategoryModal from '../../../Category/Category';
import WorkModal from '../../Work/Work';

interface OpenButtonProps {
  onClose: (tempInfo) => void;
  TemplateInfo;
}

interface CreateData {
  Category: string;
  CategoryID: number;
  CategoryUpdateTime: Date;
  Subcategory: string;
  SubcategoryID: number;
  SubcategoryUpdateTime: Date;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose, TemplateInfo }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [isPageFlg, setPageFlg] = useState<number>(0);

  const [pCreateData, setPCreateData] = useState<CreateData>();
  const [nCreateData, setNCreateData] = useState<CreateData>();

  const [timeStart, setTimeStart] = useState<string>(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
  const [timeEnd, setTimeEnd] = useState<string>(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);

  const [disTitle, setDisTitle] = useState<string>("");
  const [disCategory, setCategory] = useState<string>("未選択");
  const [disCategoryID, setCategoryID] = useState<number>(0);
  const [disSubcategory, setSubcategory] = useState<string>("未選択");
  const [disSubcategoryID, setSubcategoryID] = useState<number>(0);
  const [SubcategoryUpdateTime, setSubcategoryUpdateTime] = useState<Date>(new Date());
  const [CategoryUpdateTime, setCategoryUpdateTime] = useState<Date>(new Date());
  const [disMemo, setMemo] = useState<string>("");
  const [disColorCode, setColorCode] = useState<string>("#eeeeee");
  const [disColor, setColor] = useState<string>("#eeeeee");
  const [isViewFlg, setIsViewFlg] = useState<boolean>(false);

  const [disWorkName, setWorkName] = useState<string>("未選択");
  const [disWorkID, setWorkID] = useState<number>(0);
  const [isWorkOpen, setWorkOpen] = useState<boolean>(false);

  const [isCategoryOpen, setisCategoryOpen] = useState<boolean>(false);

  useEffect(() => {
    SetNowDataTable(0)
    SetNowDataTable(1)
    SetCalendarData(TemplateInfo)
  }, []);

  const SetCalendarData = (tempInfo) => {
    console.log(tempInfo)
    if(tempInfo.IncomeFlg === 1){
      setPageFlg(1)
    }else{
      setPageFlg(0)
    }

    setDisTitle(tempInfo.Title)
    setCategory(tempInfo.Category)
    setCategoryID(tempInfo.CategoryID)
    setSubcategory(tempInfo.Subcategory)
    setSubcategoryID(tempInfo.SubcategoryID)
    setMemo(tempInfo.Remarks)
    setTimeStart(tempInfo.StartDateTime)
    setTimeEnd(tempInfo.EndDateTime)
    setIsViewFlg(tempInfo.ViewFlg)
    setWorkID(tempInfo.WorkID)
    setWorkName(tempInfo.WorkName !== "" && tempInfo.WorkName !== undefined ? tempInfo.WorkName : "未選択")

    ColorCheck(tempInfo.Color)
  }

  const ChangeData = (index: number) => {
    const nowPage = isPageFlg;
    if (nowPage == index) {
      return;
    }
    setPageFlg(index);

    SetNowDataTable(nowPage);
    SetNowData(index);
    
  }

  const SetNowDataTable = (PageIndex:number) => {
    switch (PageIndex) {
      case 0:
        setPCreateData({
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime
        })
        break;

      case 1:
        setNCreateData({
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime,
        })
        break;
    }
  }

  const SetNowData = (PageIndex:number) => {
    switch (PageIndex) {
      case 0:
        setCategory(pCreateData?.Category || "");
        setCategoryID(pCreateData?.CategoryID || 0);
        setCategoryUpdateTime(pCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(pCreateData?.Subcategory || "");
        setSubcategoryID(pCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(pCreateData?.SubcategoryUpdateTime || new Date());
        break;

      case 1:
        setCategory(nCreateData?.Category || "");
        setCategoryID(nCreateData?.CategoryID || 0);
        setCategoryUpdateTime(nCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(nCreateData?.Subcategory || "");
        setSubcategoryID(nCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(nCreateData?.SubcategoryUpdateTime || new Date());
        break;
    }
  }

  const SaveTransactionData = async () => {
    if(disTitle === "+"){
      setErrorMessages("タイトルに「+」は使えません。")
      return;
    }
    if(timeStart === ""){
      setErrorMessages("開始時間は必ず入力してください。")
      return;
    }
    if(timeEnd === ""){
      setErrorMessages("終了時間は必ず入力してください。")
      return;
    }
    if(timeStart === timeEnd){
      setErrorMessages("開始時間と終了時間で同じ時間は指定できません。")
      return;
    }
    if(timeStart === timeEnd){
      setErrorMessages("開始時間と終了時間で同じ時間は指定できません。")
      return;
    }
    if(timeStart > timeEnd){
      setErrorMessages("終了時間より開始時間のほうが大きくできません。。")
      return;
    }

    SetNowData(isPageFlg)
    const retVal = { 
      Title:disTitle,
      StartDateTime: timeStart,
      EndDateTime: timeEnd,
      IncomeFlg: isPageFlg,
      ViewFlg: isViewFlg,
      Category: disCategory,
      CategoryID: disCategoryID,
      CategoryUpdateTime: CategoryUpdateTime,
      Subcategory: disSubcategory,
      SubcategoryID: disSubcategoryID,
      SubcategoryUpdateTime: SubcategoryUpdateTime,
      WorkID: isPageFlg === 1 ? disWorkID : 0,
      WorkName: isPageFlg === 1 ? disWorkName : "",
      Remarks: disMemo,
      Color:disColor
    }
    onClose(retVal)
  }

  // モーダルを閉じる処理と、選択された値の保持
  const handleCategoryValue = (category, subcategory) => {
    if (category === null && subcategory === null) {
      return;
    }
    else if (!(category === undefined && subcategory === undefined)) {

      setCategoryID(category?.CategoryID);
      setCategory(category?.CategoryName);
      setCategoryUpdateTime(category?.UpdateTime);

      if(subcategory === null){
        setSubcategoryID(0);
      }else if (subcategory?.SubcategoryID === "") {
        setSubcategoryID(0);
      } else {
        setSubcategoryID(subcategory?.SubcategoryID);
      }

      setSubcategory(subcategory?.SubcategoryName);
      setSubcategoryUpdateTime(subcategory?.UpdateTime);
    }

    setisCategoryOpen(false); // モーダルを閉じる
  };

  const handleWorkValue = (workID:number, workName:string) => {
    setWorkID(workID);
    setWorkName(workName);
    setWorkOpen(false);
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
    <div className='TransactionPopUp'>
      <h1>予定変更</h1>

      <div className='Category'>
        <div>
          <div className='TagSwitcher'>
            <button onClick={() => ChangeData(0)} className={isPageFlg == 0 ? 'active' : ''}>予定</button>
            <button onClick={() => ChangeData(1)} className={isPageFlg == 1 ? 'active' : ''}>仕事</button>
          </div>
          <div className='TransactionGroup'>
            <span className='TransactionLabel'>タイトル</span>
            <input
              type="text"
              value={disTitle}
              onChange={(e) => setDisTitle(e.target.value)}
              className='TransactionValue'
            />
          </div>
          <div>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>日付</span>
              <input
                className='TransactionValueTime'
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value.toString())}
              />
              ～
              <input
                className='TransactionValueTime'
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value.toString())}
              />
            </div>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>カテゴリ</span>
              <div className='TransactionValueSelect' onClick={() => setisCategoryOpen(true)} >
                <span className='TransactionSelectspan'>{disCategory}</span>
                <span className='TransactionSelectspan'>{disSubcategory}</span>
              </div>
            </div>
            {isPageFlg === 1 &&(
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>案件</span>
                <div className='TransactionValueSelect' onClick={() => setWorkOpen(true)} >
                  <span className='TransactionSelectspan'>{disWorkName}</span>
                </div>
              </div>
            )}
            <div className="category-container">
              <span className="category-label">表示有無</span>
              <input
                type="checkbox"
                checked={isViewFlg}
                onChange={(e) => setIsViewFlg(e.target.checked)}
              />
            </div>
            <div className="category-container">
              <span className="category-label">カラー</span>
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
          </div>
        </div>

        <div className='TransactionMemoLabel'>
          <textarea className='TransactionMemo' value={disMemo} onChange={(e) => setMemo(e.target.value)} />
        </div>
      </div>

      <div>
        {isCategoryOpen && (
          <>
            <CategoryModal 
              onClose={handleCategoryValue} 
              flg={true} 
              pageFlg={isPageFlg}
            />
          </>
        )}
      </div>
      
      <div>
        {isWorkOpen && (
          <>
            <WorkModal 
              onClose={handleWorkValue} 
              flg={true}
            />
          </>
        )}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveTransactionData()} className='btn-style'>登録</button>
        <button onClick={() => onClose(true)} className='btn-style'>削除</button>
        <button onClick={() => onClose(null)} className='btn-style'>閉じる</button>
      </div>
      <div>
        <span>{errorMessages}</span>
      </div>
    </div>
  );
};

export default CreateTransaction;