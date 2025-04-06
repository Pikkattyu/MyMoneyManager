import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
//import TransactionSummary from '../pages/DisCategory';
import TransactionCalendar from './DisTransactionCalendar';
import DisTransactionDaily from './DisTransactionDaily';
import ChangeTransaction from './ChangeTransaction';
import CreateTransaction from './CreateTransaction';
import CreateMemo from '../Memo/CreateMemo';
import ChangeMemo from '../Memo/ChangeMemo';

const Transaction: React.FC = () => {
  const [isPageFlg, setPageFlg] = useState<number>(3);
  const [TransactionID, setTransactionID] = useState<number>(0);
  const [MemoID, setMemoID] = useState<number>(0);
  const [isPopUpFlg, setPopUpFlg] = useState<number>(0);
  const [DisDate, setDisDate] = useState<string>(() => {
    const year = new Date().getFullYear(); // 現在の年を取得
    const month = String(new Date().getMonth() + 1).padStart(2, '0'); // 現在の月を取得し、2桁にフォーマット
    return `${year}${month}`; // "YYYYMM" 形式で文字列を返す
  });

  const [TransactionData, setTransactionData] = useState<any[][]>([]);
  const [MemoData, setMemoData] = useState<any[]>([]);


  const [Income, setIncome] = useState<string>('');
  const [Expenses, setExpenses] = useState<string>('');
  const [Total, setTotal] = useState<string>('');
  const [Balance, setBalance] = useState<string>('');
  
  const [UpdateFlg, setUpdateFlg] = useState<number>(0);

  const [moveKind, setMoveKind] = useState<number>(0);
  const [moveDate, setMoveDate] = useState<Date>(new Date);
  const [moveAmount, setMoveAmount] = useState<number>(0);
  const [moveMemo, setMoveMemo] = useState<string>("");
  const [moveAssetsID, setMoveAssetsID] = useState<number>(0);
  const [moveCategoryID, setMoveCategoryID] = useState<number>(0);
  const [moveSubcategoryID, setMoveSubcategoryID] = useState<number>(0);
  const [moveAmount2, setMoveAmount2] = useState<number>(0);
  const [moveAssets2ID, setMoveAssets2ID] = useState<number>(0);

  const [startFlg, setStartFlg] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if(!startFlg){
        setStartFlg(true)
        setPageFlg(Number(localStorage.getItem('DefaultTransactionDisplay')))
      }
      try {
        const response = await fetch('/api/gettransactiondata?date=' + DisDate, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const transaction = data.transaction;
        const assets = data.assets;
        const transactionAll = data.transactionall;
        const memos = data.memo;
        setMemoData(memos);

        let sum = 0;
        assets.forEach((asset: any) => {
          if (asset.Flg === 0) {
            sum += asset.Amount;
          } else {
            sum -= asset.Amount;
          }
        });
        if (transactionAll){
          transactionAll.forEach((ta: any) => {
            if ((ta.Flg === 0 && ta.Kind === 0) || (ta.Flg === 0 && ta.Kind === 1)) {
              sum += ta.Amount;
            } else if((ta.Flg === 1 && ta.Kind === 1) || (ta.Flg === 1 && ta.Kind === 0)) {
              sum -= ta.Amount;
            }else if((ta.Flg === 0 && ta.Kind === 2 && ta.flg_a1 === 1) || (ta.Flg === 1 && ta.Kind === 2 && ta.flg_a1 === 0)){
              sum -= ta.Amount;
            }else{
              sum += ta.Amount;
            }
          });
        }

        let sortedData:any[] = [];
        if (transaction !== null) {
          sortedData = transaction.sort((a: any, b: any) => {
            // Date文字列から 'T' を削除して比較します
            const dateA = new Date(a.Date.replace('T', ' '));
            const dateB = new Date(b.Date.replace('T', ' '));

            return dateB.getTime() - dateA.getTime();
          });
        } else {
          setIncome("0");
          setExpenses("0");
          setTotal("0");
          setBalance(sum.toLocaleString());
          setTransactionData([]);
        }

        // 2次元配列を宣言
        const transaction_for_date: any[][] = [];
        // ループの初期設定
        let HozDate = "";// 現在の日付を追跡
        let index = -1;
        let HozTransactionID = 0;
        for (let i = 0; i < sortedData.length; i++) {
          if (sortedData[i].Date.split("T")[0] !== HozDate) {
            // 日付が変わった場合、現在のグループを保存し、新しいグループを開始
            transaction_for_date.push([sortedData[i]]);

            // 新しい日付に更新し、新しいグループを開始
            HozDate = sortedData[i].Date.split("T")[0];
            index++;
          } else {
            // 同じ日付の場合、現在のグループに追加
            if (sortedData[i].TransactionID !== HozTransactionID) {
              transaction_for_date[index].push(sortedData[i]);
            }else{
              transaction_for_date[index][transaction_for_date[index].length - 1].Assets2Name = sortedData[i].AssetsName
              //transaction_for_date[index][transaction_for_date[index].length - 1].TransactionInfomation2ID = sortedData[i].TransactionInfomationID
              transaction_for_date[index][transaction_for_date[index].length - 1].flg_a12 = sortedData[i].flg_a1
              transaction_for_date[index][transaction_for_date[index].length - 1].Flg2 = sortedData[i].Flg
              transaction_for_date[index][transaction_for_date[index].length - 1].Excluded2 = sortedData[i].Excluded
            }
          }
          HozTransactionID = sortedData[i].TransactionID;
        }

        let p_sum = 0;
        let n_sum = 0;
        if(transaction !== null){
          transaction.forEach((tran: any) => {
            if (tran.Kind !== 2) {
              if ((tran.Kind === 0 && tran.Flg === 0 && !tran.Excluded) || (tran.Flg === 0 && tran.Kind === 1 && !tran.Excluded)) {
                p_sum += tran.Amount;
              } else if((tran.Kind === 1 && tran.Flg === 1 && !tran.Excluded) || (tran.Flg === 1 && tran.Kind === 0 && !tran.Excluded)) {
                n_sum += tran.Amount;
              }
            }else if (tran.Excluded){
              if((tran.Flg === 0 && tran.flg_a1 === 1) || (tran.Flg === 1 && tran.flg_a1 === 0))
              {
                n_sum += tran.Amount;
              }else{
                p_sum += tran.Amount;
              }
            }
          });
        }

        setIncome(p_sum.toLocaleString());
        setExpenses(n_sum.toLocaleString());
        setTotal((p_sum - n_sum).toLocaleString());
        setBalance(sum.toLocaleString());
        setTransactionData(transaction_for_date);

      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(error);
        }
      }
    };

    fetchData();
  }, [DisDate, UpdateFlg]);

  const ChangePage = (button: boolean, number: number, index: number, move:any) => {
    setUpdateFlg(UpdateFlg => UpdateFlg + 1)
    //ページが変わるときはbutton:true, ポップアップの時はbutton:false
    if(number === 4){
      if (button) {
        setPageFlg(number);
      } else {
        setPopUpFlg(number);
        setMemoID(index);
      }
    }else{
      if (button) {
        setPageFlg(number);
      } else {
        setPopUpFlg(number);
        setTransactionID(index);
      }
    }

    if(move === null){
      setMoveDate(new Date())
      setMoveAmount(0)
      setMoveMemo("")
      setMoveAssetsID(0)
      setMoveCategoryID(0)
      setMoveSubcategoryID(0)
      setMoveKind(Number(localStorage.getItem('DefaultTransactionType')))
  
      setMoveAmount2(0)
      setMoveAssets2ID(0)
    }else{
      setMoveDate(move.moveDate || new Date())
      setMoveAmount(move.moveAmount || 0)
      setMoveMemo(move.moveMemo || "")
      setMoveAssetsID(move.moveAssetsID || 0)
      setMoveCategoryID(move.moveCategoryID || 0)
      setMoveSubcategoryID(move.moveSubcategoryID || 0)
      setMoveKind(move.moveKind)
  
      setMoveAmount2(move.moveAmount2 || 0)
      setMoveAssets2ID(move.moveAssets2ID || 0)
    }
  };

  const ChangePopUp = (button: boolean, number: number, move:any) => {
    if (button) {
      //保存されましたとか書く
    }
    
    if(number === 1){
      if(move === null){
        setMoveDate(new Date())
        setMoveAmount(0)
        setMoveMemo("")
        setMoveAssetsID(0)
        setMoveCategoryID(0)
        setMoveSubcategoryID(0)
        setMoveKind(Number(localStorage.getItem('DefaultTransactionType')))
    
        setMoveAmount2(0)
        setMoveAssets2ID(0)
      }else{
        setMoveDate(move.moveDate || new Date())
        setMoveAmount(move.moveAmount || 0)
        setMoveMemo(move.moveMemo || "")
        setMoveAssetsID(move.moveAssetsID || 0)
        setMoveCategoryID(move.moveCategoryID || 0)
        setMoveSubcategoryID(move.moveSubcategoryID || 0)
        setMoveKind(move.moveKind)
    
        setMoveAmount2(move.moveAmount2 || 0)
        setMoveAssets2ID(move.moveAssets2ID || 0)
      }
    }

    setUpdateFlg(UpdateFlg => UpdateFlg + 1)
    setPopUpFlg(number);
  };

  const MonthChange = (increment: number) => {
    const year = parseInt(DisDate.slice(0, 4), 10);
    const month = parseInt(DisDate.slice(4), 10);

    // 計算後の月と年を調整
    let newYear = year;
    let newMonth = month + increment;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    // 新しいDisDateを設定
    setDisDate(`${newYear}${String(newMonth).padStart(2, '0')}`);
  };


  return (
    <div className='transaction-form'>
      <div>
        <div className='transaction-header-month'>
          <button onClick={() => MonthChange(-1)}>◀</button>
          <div><span>{DisDate.slice(0, 4)}年</span><span>{DisDate.slice(4)}月</span></div>
          <button onClick={() => MonthChange(1)} >▶</button>
        </div>
        <div className='transaction-header'>
          <div className='text-center'>
            <span className='text-block'>収入</span>
            <span className='text-block'>¥ {Income}</span>
          </div>
          <div className='text-center'>
            <span className='text-block'>支出</span>
            <span className='text-block'>¥ {Expenses}</span>
          </div>
          <div className='text-center'>
            <span className='text-block'>合計</span>
            <span className='text-block'>¥ {Total}</span>
          </div>
          <div className='text-center'>
            <span className='text-block'>残高</span>
            <span className='text-block'>¥ {Balance}</span>
          </div>
        </div>
        <div className='transaction-header'>
          <button onClick={() => setPageFlg(2)} className={isPageFlg === 2 ? 'active' : ''}>カレンダー</button>
          <button onClick={() => setPageFlg(3)} className={isPageFlg === 3 ? 'active' : ''}>日別</button>
        </div>
      </div>

      <div onClick={() => setPopUpFlg(3)} className="floating-button-memo">
        <img src="MemoIcon.png" alt="MemoIcon" className="icon-style" />
      </div>

      <div onClick={() => ChangePopUp(false, 1, null)} className="floating-button">
        +
      </div>


      {isPageFlg == 1 && (
        <>
          <DisTransactionDaily transactionData={TransactionData} memoData={MemoData} onClose={ChangePage} />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <TransactionCalendar getdate={DisDate} transactionData={TransactionData} memoData={MemoData} onClose={ChangePage}/>
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <DisTransactionDaily transactionData={TransactionData} memoData={MemoData} onClose={ChangePage} />
        </>
      )}

      {isPopUpFlg == 1 && (
        <>
          <div className="overlay"></div>
          <CreateTransaction 
            moveKind={moveKind}
            moveDate={moveDate} 
            moveAmount={moveAmount} 
            moveMemo={moveMemo} 
            moveAssetsID={moveAssetsID} 
            moveCategoryID={moveCategoryID} 
            moveSubcategoryID={moveSubcategoryID} 
            moveAmount2={moveAmount2} 
            moveAssets2ID={moveAssets2ID} 
            onClose={ChangePopUp} />
        </>
      )}
      {isPopUpFlg == 2 && (
        <>
          <div className="overlay"></div>
          <ChangeTransaction transactionID={TransactionID} onClose={ChangePopUp} />
        </>
      )}
      {isPopUpFlg == 3 && (
        <>
          <div className="overlay"></div>
          <CreateMemo onClose={ChangePopUp}/>
        </>
      )}
      {isPopUpFlg == 4 && (
        <>
          <div className="overlay"></div>
          <ChangeMemo memoID={MemoID} onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default Transaction;
