import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート
//import TransactionSummary from '../pages/DisCategory';
//import TransactionCalendar from '../pages/DisCategory';
import DisTransactionDaily from '../pages/DisTransactionDaily';
import ChangeTransaction from '../pages/ChangeTransaction';
import CreateTransaction from '../pages/CreateTransaction';

const Transaction: React.FC = () => {
  const [isPageFlg, setPageFlg] = useState<Number>(0);
  const [TransactionID, setTransactionID] = useState<Number>(0);
  const [isPopUpFlg, setPopUpFlg] = useState<Number>(0);
  const [DisDate, setDisDate] = useState<string>(() => {
    const year = new Date().getFullYear(); // 現在の年を取得
    const month = String(new Date().getMonth() + 1).padStart(2, '0'); // 現在の月を取得し、2桁にフォーマット
    return `${year}${month}`; // "YYYYMM" 形式で文字列を返す
  });

  const [errorMessages, setErrorMessages] = useState<string>('');
  const [TransactionData, setTransactionData] = useState<any[][]>([]);


  const [Income, setIncome] = useState<string>('');
  const [Expenses, setExpenses] = useState<string>('');
  const [Total, setTotal] = useState<string>('');
  const [Balance, setBalance] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
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

        let sum = 0;
        assets.forEach((asset: any) => {
          if (asset.Flg === 0) {
            sum += asset.Amount;
          } else {
            sum -= asset.Amount;
          }
        });

        transactionAll.forEach((ta: any) => {
          if ((ta.Flg === 0 && ta.Kind === 0) || (ta.Flg === 1 && ta.Kind === 1)) {
            sum += ta.Amount;
          } else {
            sum -= ta.Amount;
          }
        });

        let sortedData;
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
        let transaction_for_date: any[][] = [];
        // ループの初期設定
        let HozDate = "";// 現在の日付を追跡
        let index = -1;
        let HozTransactionID = 0;

        for (let i = 0; i < sortedData.length; i++) {
          if (sortedData[i].Date !== HozDate) {
            // 日付が変わった場合、現在のグループを保存し、新しいグループを開始
            transaction_for_date.push([sortedData[i]]);

            // 新しい日付に更新し、新しいグループを開始
            HozDate = sortedData[i].Date;
            index++;
          } else {
            // 同じ日付の場合、現在のグループに追加
            if (sortedData[i].TransactionID !== HozTransactionID) {
              transaction_for_date[index].push(sortedData[i]);
            }
          }
          HozTransactionID = sortedData[i].TransactionID;
        }

        let p_sum = 0;
        let n_sum = 0;
        transaction.forEach((tran: any) => {
          if (tran.Kind !== 2) {
            if ((tran.Kind === 0 && tran.Flg === 0) || (tran.Flg === 1 && tran.Kind === 1)) {
              p_sum += tran.Amount;
            } else {
              n_sum += tran.Amount;
            }
          }
        });

        setIncome(p_sum.toLocaleString());
        setExpenses(n_sum.toLocaleString());
        setTotal((p_sum - n_sum).toLocaleString());
        setBalance(sum.toLocaleString());
        setTransactionData(transaction_for_date);

      } catch (error) {
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
  }, [DisDate]);

  const ChangePage = (button: boolean, number: Number, index: Number) => {
    //ページが変わるときはbutton:true, ポップアップの時はbutton:false
    if (button) {
      setPageFlg(number);
    } else {
      setPopUpFlg(number);
      setTransactionID(index);
    }
  };

  const ChangePopUp = (button: boolean, number: Number) => {
    if (button) {
      //保存されましたとか書く
    }
    setPageFlg(number);
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
    <div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div><button onClick={() => MonthChange(-1)}>◀</button></div>
          <div><span>{DisDate.slice(0, 4)}年</span><span>{DisDate.slice(4)}月</span></div>
          <div><button onClick={() => MonthChange(1)}>▶</button></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <span>収入</span>
            <span>¥ {Income}</span>
          </div>
          <div>
            <span>支出</span>
            <span>¥ {Expenses}</span>
          </div>
          <div>
            <span>合計</span>
            <span>¥ {Total}</span>
          </div>
          <div>
            <span>残高</span>
            <span>¥ {Balance}</span>
          </div>
        </div>
        <div>
          <span onClick={() => setPageFlg(1)}>概要</span><span onClick={() => setPageFlg(1)}>カレンダー</span><span onClick={() => setPageFlg(1)}>日別</span>
        </div>
      </div>

      <div onClick={() => setPopUpFlg(1)} className="floating-button">
        +
      </div>


      {isPageFlg == 1 && (
        <>
          <DisTransactionDaily transactionData={TransactionData} onClose={ChangePage} />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <DisTransactionDaily transactionData={TransactionData} onClose={ChangePage} />
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <DisTransactionDaily transactionData={TransactionData} onClose={ChangePage} />
        </>
      )}

      {isPopUpFlg == 1 && (
        <>
          <CreateTransaction onClose={ChangePopUp} />
        </>
      )}
      {isPopUpFlg == 2 && (
        <>
          <ChangeTransaction transactionID={TransactionID} onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default Transaction;
