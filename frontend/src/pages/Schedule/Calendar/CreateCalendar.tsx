import React, { useEffect, useState } from 'react';
import '../../../styles.css'; // CSSファイルのインポート
import CategoryModal from '../Category/Category';
import WorkModal from '../Setting/Work/Work';
import { getDate } from 'date-fns';

interface OpenButtonProps {
  /* 
  moveKind:           number;
  moveDate:           Date;
  moveMemo:           string;
  moveCategoryID:     number;
  moveSubcategoryID:  number;
  */
  onClose: (number: number, index:number) => void;
}

interface Category {
  CategoryID: number;
  CategoryName: string;
  UpdateTime: Date;
}

interface Subcategory {
  SubcategoryNo: number | undefined;
  SubcategoryID: number | undefined;
  SubcategoryName: string;
  UpdateTime: Date;
}

interface CreateData {
  Category: string;
  CategoryID: number;
  CategoryUpdateTime: Date;
  Subcategory: string;
  SubcategoryID: number;
  SubcategoryUpdateTime: Date;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [isPageFlg, setPageFlg] = useState<number>(0);

  const [pCreateData, setPCreateData] = useState<CreateData>();
  const [nCreateData, setNCreateData] = useState<CreateData>();

  const [dateStart, setDateStart] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
  const [timeStart, setTimeStart] = useState<string>(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
  const [dateEnd, setDateEnd] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
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
  const [isCategoryID, setisCategoryID] = useState<number>(0);
  const [isSubcategoryID, setisSubcategoryID] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gettransactionrelation', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const categoryies = data.category;

        const tran:any = {};
        /* 
        tran.Kind = moveKind;
        tran.Date = moveDate || new Date();
        tran.Memo = moveMemo;
        tran.Amount = moveAmount;
        tran.AssetsID = moveAssetsID;
        tran.CategoryID = moveCategoryID;
        tran.SubcategoryID = moveSubcategoryID;
        */
       
        tran.Kind = 0;
        tran.Date = new Date();
        tran.Memo = "";
        tran.CategoryID = 0;
        tran.SubcategoryID = 0;
        SetTransactionData(tran)
        SearchCategory(tran.CategoryID, tran.SubcategoryID, categoryies)
        SetNowDataTable(0)
        SetNowDataTable(1)
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/gettransactionrelation', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      }

      const data = await response.json();

    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  };

  const SetTransactionData = (transaction) => {
    setPageFlg(transaction.Kind)

    const newDate = new Date(transaction.Date.getTime() + 9 * 60 * 60 * 1000);
    // 日付と時刻を取得
    const nd = newDate.toISOString()
    const date = nd.split("T")[0]; // "2025-01-15"
    const time = nd.split("T")[1].slice(0, 5); // "00:00:00"
    setDateStart(date)
    setTimeStart(time)
    setDateEnd(date)
    setTimeEnd(time)

    setMemo(transaction.Memo || "");
  } 

  const SearchCategory = (categoryID:number, subcategoryID:number, categorys:any[]) =>{
    categorys.forEach((category: any) => {
      if(subcategoryID === 0 && categoryID === category.CategoryID){
        setCategory(category.CategoryName || "");
        setCategoryID(category.CategoryID || 0);
        setCategoryUpdateTime(category.UpdateTime || new Date());
        setSubcategory("");
      }else if(subcategoryID === category.SubcategoryID){
        setCategory(category.CategoryName || "");
        setCategoryID(category.CategoryID || 0);
        setCategoryUpdateTime(category.UpdateTime || new Date());
        setSubcategory(category.SubcategoryName || "");
        setSubcategoryID(category.SubcategoryID || 0);
        setSubcategoryUpdateTime(category.UpdateTime || new Date());
      }
    })
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
    const disDateStart = new Date(dateStart + "T" + timeStart + "Z")
    const disDateEnd = new Date(dateEnd + "T" + timeEnd + "Z")
    SetNowData(isPageFlg)
    try {
      const response = await fetch('/api/createcalendar', {
        method: 'POST',
        body: JSON.stringify({ 
          Title:disTitle,
          StartDateTime: disDateStart,
          EndDateTime: disDateEnd,
          IncomeFlg: isPageFlg,
          ViewFlg: isViewFlg,
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime,
          WorkID: isPageFlg === 1 ? disWorkID : 0,
          Remarks: disMemo 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
      else {
        onClose(0, 0)
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

  // モーダルを閉じる処理と、選択された値の保持
  const handleCategoryValue = (category, subcategory) => {
    if (category === null && subcategory === null) {
      setCategoryID(0)
      setCategory("未選択")

      setSubcategoryID(0)
      setSubcategory("未選択");

      fetchData()
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

  // モーダルを開く処理
  const handleOpenCategory = () => {
    setisCategoryID(disCategoryID);
    setisSubcategoryID(disSubcategoryID);
    setisCategoryOpen(true);      
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
      <h1>予定入力</h1>

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
                className='TransactionValue'
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value.toString())}
              />
              <input
                className='TransactionValueTime'
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value.toString())}
              />
              ～
              <input
                className='TransactionValue'
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value.toString())}
              />
              <input
                className='TransactionValueTime'
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value.toString())}
              />
            </div>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>カテゴリ</span>
              <div className='TransactionValueSelect' onClick={() => handleOpenCategory()} >
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
        <button onClick={() => onClose(0, 0)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;