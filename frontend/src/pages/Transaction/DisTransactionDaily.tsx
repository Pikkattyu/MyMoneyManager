import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  transactionData: any[][];
  memoData: any[];
  onClose: (isButton: boolean, number: Number, index: Number, move:any) => void;
}

const TransactionDaily: React.FC<OpenButtonProps> = ({ transactionData, memoData, onClose }) => {
  const [TransactionData, setTransactionData] = useState<
    { date: string; transactions: any[]; memos: any[] }[]
  >([]);

  // 日付を日本語フォーマットに変換する関数
  const formatDateToJapanese = (isoString: string): string => {
    const dataDate = new Date(isoString);
    const date = new Date(dataDate.getTime() - 9 * 60 * 60 * 1000); // UTC→JST
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  function truncateText(input: string, maxLength: number = 10): string {
    if (!input) {
      return ""; // データがない場合は空文字を返す
    }
    if (input.length <= maxLength) {
      return input; // データが10文字以内ならそのまま返す
    }
    return input.slice(0, maxLength) + "…"; // 10文字を超える場合は切り取って "…" を追加
  };  

  // 日付ごとにデータを整理
  useEffect(() => {
    const groupedData: Record<string, { transactions: any[]; memos: any[] }> = {};
  
    // transactionDataを日付ごとに整理
    transactionData.forEach((transactions) => {
      transactions.forEach((item) => {
        const date = formatDateToJapanese(item.Date);
        if (!groupedData[date]) {
          groupedData[date] = { transactions: [], memos: [] };
        }
        groupedData[date].transactions.push(item);
      });
    });
  
    // memoDataを日付ごとに整理
    if(memoData !== null){
      memoData.forEach((memo) => {
        const date = formatDateToJapanese(memo.Date);
        if (!groupedData[date]) {
          groupedData[date] = { transactions: [], memos: [] };
        }
        memo.Txt = truncateText(memo.Txt || "");
        groupedData[date].memos.push(memo);
      });
    }
  
    // 日付キーをすべて取得して昇順にソート
    const sortedDates = Object.keys(groupedData).sort(
      (a, b) =>
        new Date(b.replace(/[年月日]/g, "/")).getTime() -
        new Date(a.replace(/[年月日]/g, "/")).getTime()
    );
  
    // ソートされた日付キーに基づいて配列を作成
    const groupedArray = sortedDates.map((date) => ({
      date,
      transactions: groupedData[date].transactions,
      memos: groupedData[date].memos,
    }));
  
    setTransactionData(groupedArray);
  }, [transactionData, memoData]);
  

  return (
    <div className="DailyTransaction-form">
      <div className="DailyTransaction-frame">
        {TransactionData.map(({ date, transactions, memos }, index) => (
          <div key={`transaction-group-${index}`} className="transaction-container">
            <div className="transaction-header">
              <span className="transaction-date">{date}</span>
            </div>

            {/* memoData を表示 */}
            {memos.length > 0 &&
              <div className="memo-box">
                {memos.map((memo) => (
                  <div
                    key={memo.MemoID}
                    className="memo-item"
                    onDoubleClick={() => onClose(false, 4, memo.MemoID, null)}
                  >
                    <span className="memo-label">メモ</span>
                    <span className="memo-title">{memo.Title}</span>
                    <span className="memo-txt">{memo.Txt}</span>
                  </div>
                ))}
              </div>
            }

            {/* transactionData を表示 */}
            {transactions.length > 0 &&
            <div className="transaction-box">
              {transactions.map((transaction) => (
                <div
                  key={transaction.TransactionID}
                  className={`transaction-item ${
                    transaction.Kind === 0 ? 'back-income'
                      : transaction.Kind === 1 ? 'back-expense'
                      : transaction.Kind === 2 ? 'back-transfer'
                      : ''
                  }`}
                  onDoubleClick={() =>
                    onClose(false, 2, transaction.TransactionID, null)
                  }
                >
                  <span
                    className={`transaction-category ${
                      transaction.Kind === 0 ? 'income'
                        : transaction.Kind === 1 ? 'expense'
                        : transaction.Kind === 2 ? 'transfer'
                        : ''
                    }`}
                  >
                    {transaction.Kind === 0 ? '収入'
                      : transaction.Kind === 1 ? '支出'
                      : transaction.Kind === 2 ? '振替'
                      : 'その他'}
                  </span>
                  <span className="transaction-category">
                    {transaction.CategoryName}
                  </span>
                  <span className="transaction-amount">
                    {transaction.Amount.toLocaleString()}
                  </span>
                  <span className="transaction-memo">{transaction.Memo}</span>
                  <span className="transaction-assets">
                    {transaction.Assets2Name !== undefined &&  (
                      <>{transaction.Assets2Name + ' → ' + transaction.AssetsName}</>
                    )}

                    {transaction.Assets2Name === undefined &&  (
                      <>{transaction.AssetsName}</>
                    )}
                  </span>
                </div>
              ))}
            </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionDaily;