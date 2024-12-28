import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import Transaction from './Transaction';

interface OpenButtonProps {
  transactionData: any[][];
  onClose: (isButton: boolean, number: Number, index: Number) => void;
}

const TransactionDaily: React.FC<OpenButtonProps> = ({ transactionData, onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [TransactionData, setTransactionData] = useState<any[][]>([]);

  const formatDateToJapanese = (isoString: string): string => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}時${date.getMinutes()}分`;
  };

  useEffect(() => {
    const updatedData = transactionData.map(transaction => {
      return transaction.map(item => {
        if (item.Date) {
          // Dateフィールドをフォーマット変更
          return {
            ...item,
            Date: formatDateToJapanese(item.Date), // 日付フォーマット変更
          };
        }
        return item;
      });
    });

    setTransactionData(updatedData);
  }, [transactionData]); // transactionDataが変更されたときにのみ実行

  return (
    <div className='DailyTransaction-form'>
      <div className='DailyTransaction-frame'>
        {TransactionData.map((transactions, index) => (
          <div key={`transaction-group-${index}`} className="transaction-container">
            <div className="transaction-header">
              <span className="transaction-date">{transactions[0].Date}</span>
            </div>
            <div className="transaction-box">
              {transactions.map((transaction) => (
                <div key={transaction.TransactionID} className="transaction-item" onDoubleClick={() => onClose(false, 2, transaction.TransactionID)}>
                  <span className="transaction-category">{transaction.CategoryName}</span>
                  <span className="transaction-amount">{transaction.Amount}</span>
                  <span className="transaction-memo">{transaction.Memo}</span>
                  <span className="transaction-assets">{transaction.AssetsName}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionDaily;