import React, { useRef, useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
//import StatisticsSummary from '../pages/DisCategory';
//import StatisticsCalendar from '../pages/DisCategory';

const Statistics: React.FC = () => {
  const [isPageFlg, setPageFlg] = useState<Number>(1);
  const [DisDate, setDisDate] = useState<string>(() => {
    const year = new Date().getFullYear(); // 現在の年を取得
    const month = String(new Date().getMonth() + 1).padStart(2, '0'); // 現在の月を取得し、2桁にフォーマット
    return `${year}${month}`; // "YYYYMM" 形式で文字列を返す
  });

  // Canvas要素への参照
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const [errorMessages, setErrorMessages] = useState<string>('');
  const [StatisticsData, setStatisticsData] = useState<any[][]>([]);

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
        const statistics = data.statistics;
        const assets = data.assets;
        const statisticsAll = data.statisticsall;

        let sum = 0;
        assets.forEach((asset: any) => {
          if (asset.Flg === 0) {
            sum += asset.Amount;
          } else {
            sum -= asset.Amount;
          }
        });

        statisticsAll.forEach((ta: any) => {
          if ((ta.Flg === 0 && ta.Kind === 0) || (ta.Flg === 1 && ta.Kind === 1)) {
            sum += ta.Amount;
          } else {
            sum -= ta.Amount;
          }
        });

        let sortedData;
        if (statistics !== null) {
          sortedData = statistics.sort((a: any, b: any) => {
            // Date文字列から 'T' を削除して比較します
            const dateA = new Date(a.Date.replace('T', ' '));
            const dateB = new Date(b.Date.replace('T', ' '));

            return dateB.getTime() - dateA.getTime();
          });
        } else {
          setStatisticsData([]);
        }

        // 2次元配列を宣言
        let statistics_for_date: any[][] = [];
        // ループの初期設定
        let HozDate = "";// 現在の日付を追跡
        let index = -1;
        let HozStatisticsID = 0;

        for (let i = 0; i < sortedData.length; i++) {
          if (sortedData[i].Date !== HozDate) {
            // 日付が変わった場合、現在のグループを保存し、新しいグループを開始
            statistics_for_date.push([sortedData[i]]);

            // 新しい日付に更新し、新しいグループを開始
            HozDate = sortedData[i].Date;
            index++;
          } else {
            // 同じ日付の場合、現在のグループに追加
            if (sortedData[i].StatisticsID !== HozStatisticsID) {
              statistics_for_date[index].push(sortedData[i]);
            }
          }
          HozStatisticsID = sortedData[i].StatisticsID;
        }

        let p_sum = 0;
        let n_sum = 0;
        statistics.forEach((tran: any) => {
          if (tran.Kind !== 2) {
            if ((tran.Kind === 0 && tran.Flg === 0) || (tran.Flg === 1 && tran.Kind === 1)) {
              p_sum += tran.Amount;
            } else {
              n_sum += tran.Amount;
            }
          }
        });

        setStatisticsData(statistics_for_date);

        // コンポーネントのアンマウント時にChart.jsインスタンスを破棄
        return () => {
            chartInstanceRef.current?.destroy();
        };

      } catch (error) {
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
    StaticsticsDataChange();

    Chart.register(PieController, ArcElement, Tooltip, Legend);
        
    if (chartRef.current) {
      // 初期データ
      const initialData = {
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [
              {
                  label: 'Dataset 1',
                  data: [300, 50, 100],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  hoverOffset: 4,
              },
          ],
      };

      // グラフを作成
      chartInstanceRef.current = new Chart(chartRef.current, {
          type: 'pie',
          data: initialData,
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      position: 'top',
                  },
              },
          },
      });
    }
    // コンポーネントのアンマウント時にChart.jsインスタンスを破棄
    return () => {
        chartInstanceRef.current?.destroy();
    };
    
  }, [DisDate]);

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

  const StaticsticsDataChange = () =>{
    const totals = {
      categoryID: new Map<number, number>(), // category_idごとの合計
      categoryName: new Map<number, string>(),
      subcategoryID: new Map<number, number>(), // subcategory_idごとの合計
      subcategoryName: new Map<number, string>(),
      assetsID: new Map<number, number>(), // assets_idごとの合計
      assetsName: new Map<number, string>(),
      user: new Map<number, { // user_noごとの合計
        categoryID: Map<number, number>, // category_idごとの合計
        categoryName: Map<number, string>,
        subcategoryID: Map<number, number>, // subcategory_idごとの合計
        subcategoryName: Map<number, string>,
        assetsID: Map<number, number>, // assets_idごとの合計
        assetsName: Map<number, string>,
      }>(),
    };

    for (const record of StatisticsData) {  
      const [
        user_no,
        category_id,
        category_name,
        subcategory_id,
        subcategory_name,
        assets_id,
        assets_name,
        amount,
      ] = record;
    
      // category_idごとの合計
      totals.categoryID.set(
        category_id,
        (totals.categoryID.get(category_id) || 0) + amount
      );
    
      // category_nameの登録
      if (!totals.categoryName.has(category_id)) {
        totals.categoryName.set(category_id, category_name);
      }
    
      // subcategory_idごとの合計
      totals.subcategoryID.set(
        subcategory_id,
        (totals.subcategoryID.get(subcategory_id) || 0) + amount
      );
    
      // subcategory_nameの登録
      if (!totals.subcategoryName.has(subcategory_id)) {
        totals.subcategoryName.set(subcategory_id, subcategory_name);
      }
    
      // assets_idごとの合計
      totals.assetsID.set(
        assets_id,
        (totals.assetsID.get(assets_id) || 0) + amount
      );
    
      // assets_nameの登録
      if (!totals.assetsName.has(assets_id)) {
        totals.assetsName.set(assets_id, assets_name);
      }
    
      // user_noごとのデータ初期化
      if (!totals.user.has(user_no)) {
        totals.user.set(user_no, {
          categoryID: new Map<number, number>(),
          categoryName: new Map<number, string>(),
          subcategoryID: new Map<number, number>(),
          subcategoryName: new Map<number, string>(),
          assetsID: new Map<number, number>(),
          assetsName: new Map<number, string>(),
        });
      }
    
      // user_noごとの集計
      const userData = totals.user.get(user_no)!;
    
      // user_noごとに category_id の合計
      userData.categoryID.set(
        category_id,
        (userData.categoryID.get(category_id) || 0) + amount
      );
    
      // user_noごとに category_name の登録
      if (!userData.categoryName.has(category_id)) {
        userData.categoryName.set(category_id, category_name);
      }
    
      // user_noごとに subcategory_id の合計
      userData.subcategoryID.set(
        subcategory_id,
        (userData.subcategoryID.get(subcategory_id) || 0) + amount
      );
    
      // user_noごとに subcategory_name の登録
      if (!userData.subcategoryName.has(subcategory_id)) {
        userData.subcategoryName.set(subcategory_id, subcategory_name);
      }
    
      // user_noごとに assets_id の合計
      userData.assetsID.set(
        assets_id,
        (userData.assetsID.get(assets_id) || 0) + amount
      );
    
      // user_noごとに assets_name の登録
      if (!userData.assetsName.has(assets_id)) {
        userData.assetsName.set(assets_id, assets_name);
      }
    }
  }

  return (
    <div className='statistics-form'>
      <div>
        <div className='statistics-header-month'>
          <button onClick={() => MonthChange(-1)}>◀</button>
          <div><span>{DisDate.slice(0, 4)}年</span><span>{DisDate.slice(4)}月</span></div>
          <button onClick={() => MonthChange(1)} >▶</button>
        </div>
        <div className='statistics-header'>
          <button onClick={() => setPageFlg(1)} className={isPageFlg === 1 ? 'active' : ''}>資産統計</button>
          <button onClick={() => setPageFlg(2)} className={isPageFlg === 2 ? 'active' : ''}>カテゴリ統計</button>
        </div>
        {isPageFlg === 1 &&(
          <div >
            <canvas ref={chartRef} />
          </div>
        )}
        {isPageFlg === 2 &&(
          <>
          </>
        )}
      </div>
    </div>
  );
};
export default Statistics;
