import React, { useRef, useEffect, useState } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

interface Assets {
  AssetsID: number;
  UserID: number;
  UserName: string
  AssetsName: string;
  UpdateTime: Date;
}

const Statistics: React.FC = () => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [DisDate, setDisDate] = useState<string>(() => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  });

  const [StatisticsTransactionData] = useState<string[]>(["カテゴリ：収入", "カテゴリ：支出", "資産：収入", "資産：支出"]);
  const [StatisticsFlg, setStatisticsFlg] = useState<boolean[]>([false, false, false, false, false, false]);
  const [StatisticsAssetsData] = useState<string[]>(["現資産：資産", "現資産：負債"]);

  const chartRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const chartInstances = useRef<(Chart | null)[]>([null, null, null, null, null, null]);

  const [disNameArray, setNameArray] = useState<string[][]>([]);
  const [disSumArray, setSumArray] = useState<number[][]>([]);
  const [disColorArray, setColorArray] = useState<string[][]>([]);

  const [errorMessages, setErrorMessages] = useState<string>('');
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [beforeTransactionData, setBeforeTransactionData] = useState<any[]>([]);
  const [isFirstFlg, setFirstFlg] = useState<boolean>(false);

  const [nowInAmount, setNowInAmount] = useState<string>('');
  const [nowOutAmount, setNowOutAmount] = useState<string>('');
  const [compareInAmount, setCompareInAmount] = useState<string>('');
  const [beforeInAmount, setBeforeInAmount] = useState<string>('');
  const [compareOutAmount, setCompareOutAmount] = useState<string>('');
  const [sumNowAmount, setSumNowAmount] = useState<string>('');
  const [beforeOutAmount, setBeforeOutAmount] = useState<string>('');
  const [sumBeforeAmount, setSumBeforeAmount] = useState<string>('');
  const [sumCompareAmount, setSumCompareAmount] = useState<string>('');

  //合計
  const [disTotal, setDisTotal] = useState<string>('0');
  //ユーザごとの合計
  const [disSubtotal, setDisSubtotal] = useState<string[]>([]);
  //ユーザごとの資産合計
  const [disSubtotal_p, setDisSubtotal_p] = useState<string[]>([]);
  const [disSubtotal_n, setDisSubtotal_n] = useState<string[]>([]);
  //資産計上
  const [disAmounts_n, setDisAmounts_n] = useState<string[][]>([]);
  const [disAmounts_p, setDisAmounts_p] = useState<string[][]>([]);
  const [disAssetsnames_p, setDisAssetsnames_p] = useState<string[][]>([]);
  const [disAssetsnames_p_color, setDisAssetsnames_p_color] = useState<string[][]>([]);
  const [disAssetsnames_n, setDisAssetsnames_n] = useState<string[][]>([]);
  const [disAssetsnames_n_color, setDisAssetsnames_n_color] = useState<string[][]>([]);
  //資産非計上
  const [disExAssetsnames_p, setDisExAssetsnames_p] = useState<string[][]>([]);
  const [disExAssetsnames_n, setDisExAssetsnames_n] = useState<string[][]>([]);
  const [disExAmounts_p, setDisExAmounts_p] = useState<string[][]>([]);
  const [disExAmounts_n, setDisExAmounts_n] = useState<string[][]>([]);

  const [disUsernames, setDisUsernames] = useState<string[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disAssetsID, setAssetsID] = useState<number>(0);

  useEffect(() => {
    // 非同期関数を定義
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getassetsall', {
          method: 'GET',
        });

        if (!response.ok) {
          setErrorMessages('資産情報の取得時にエラーしました。');
          return;
        }

        const data = await response.json();
        const assets = data.data; // データを状態変数に格納
        const transactions = data.transactions; // データを状態変数に格納

        let hozUserNo = -1;
        const usernames: string[] = [];

        let index = -1;
        let total = 0;
        const subtotal_p: number[] = [];
        let subtotal_p_conv: string[] = [];
        const subtotal_n: number[] = [];
        let subtotal_n_conv: string[] = [];

        const amounts_p: string[][] = [];
        const amounts_n: string[][] = [];
        const assetsnames_p: string[][] = [];
        const assetsnames_p_color: string[][] = [];
        const assetsnames_n: string[][] = [];
        const assetsnames_n_color: string[][] = [];

        const Examounts_p: string[][] = [];
        const Examounts_n: string[][] = [];
        const Exassetsnames_p: string[][] = [];
        const Exassetsnames_n: string[][] = [];

        let subtotal_conv: string[] = [];

        let CorrectVal: number;

        // ユーザ情報ごとにデータを分ける
        assets.forEach((asset: any) => {
          CorrectVal = 0;
          transactions.forEach((transaction: any) => {
            if (asset.AssetsID === transaction.AssetsID) {
              if (transaction.Kind === 0) {
                if (transaction.Flg === 0) {
                  CorrectVal += transaction.Amount;
                } else {
                  CorrectVal -= transaction.Amount;
                }
              } else if (transaction.Kind === 1) {
                if (transaction.Flg === 0) {
                  CorrectVal += transaction.Amount;
                } else {
                  CorrectVal -= transaction.Amount;
                }
              } else {
                if (transaction.Flg === 0) {
                  CorrectVal -= transaction.Amount;
                } else {
                  CorrectVal += transaction.Amount;
                }
              }
            }
          });
          CorrectVal += asset.Amount;

          if (hozUserNo !== asset.UserNo) {
            hozUserNo = asset.UserNo;
            usernames.push(asset.UserName);
            if (asset.Flg === 0) {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded) {
                subtotal_p.push(0);
                
                //資産計上は空
                amounts_p.push([]);
                assetsnames_p.push([]);
                assetsnames_p_color.push([]);

                //資産非計上に値を入れる
                Examounts_p.push([CorrectVal.toLocaleString()]);
                Exassetsnames_p.push([asset.AssetsName]);
              } else {
                subtotal_p.push(CorrectVal);

                //資産計上に値を入れる
                amounts_p.push([CorrectVal.toLocaleString()]);
                assetsnames_p.push([asset.AssetsName]);
                assetsnames_p_color.push([asset.Backgroundcolor]);

                //資産非計上は空
                Examounts_p.push([]);
                Exassetsnames_p.push([]);
              }
              subtotal_n.push(0);
              amounts_n.push([]);
              assetsnames_n.push([]);
              assetsnames_n_color.push([]);
              Examounts_n.push([]);
              Exassetsnames_n.push([]);
            } else {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded){
                subtotal_n.push(0)
                
                //資産計上は空
                amounts_n.push([]);
                assetsnames_n.push([]);
                assetsnames_n_color.push([]);

                //資産非計上に値を入れる
                Examounts_n.push([CorrectVal.toLocaleString()]);
                Exassetsnames_n.push([asset.AssetsName]);
              }else{
                subtotal_n.push(CorrectVal);

                //資産計上に値を入れる
                amounts_n.push([CorrectVal.toLocaleString()]);
                assetsnames_n.push([asset.AssetsName]);
                assetsnames_n_color.push([asset.Backgroundcolor])

                //資産非計上は空
                Examounts_n.push([]);
                Exassetsnames_n.push([]);
              }
              subtotal_p.push(0);
              amounts_p.push([]);
              assetsnames_p.push([]);
              assetsnames_p_color.push([]);
              Exassetsnames_p.push([]);
              Examounts_p.push([]);
            }
            index++;
          } else {
            if (asset.Flg == 0) {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded){
                Examounts_p[index].push(CorrectVal.toLocaleString());
                Exassetsnames_p[index].push(asset.AssetsName);
              }else{
                subtotal_p[index] += CorrectVal;
                amounts_p[index].push(CorrectVal.toLocaleString());
                assetsnames_p[index].push(asset.AssetsName);
                assetsnames_p_color[index].push(asset.Backgroundcolor);
              }
            } else {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded){
                Examounts_n[index].push(CorrectVal.toLocaleString());
                Exassetsnames_n[index].push(asset.AssetsName);
              }else{
                subtotal_n[index] += CorrectVal;
                amounts_n[index].push(CorrectVal.toLocaleString());
                assetsnames_n[index].push(asset.AssetsName);
                assetsnames_n_color[index].push(asset.Backgroundcolor);
                
              }
            }
          }

          //資産非計上の場合、合計額に含まない
          if (!asset.Excluded){
            total += CorrectVal;
          }
        });

        SetAssetsData(assets);

        // 小計を3桁コンマ区切りで保存
        subtotal_p_conv = subtotal_p.map(value => value.toLocaleString());
        subtotal_n_conv = subtotal_n.map(value => value.toLocaleString());
        subtotal_conv = subtotal_p.map((value, i) => (value - subtotal_n[i]).toLocaleString());

        setDisTotal(total.toLocaleString());
        setDisSubtotal(subtotal_conv);
        setDisSubtotal_p(subtotal_p_conv);
        setDisSubtotal_n(subtotal_n_conv);
        setDisAmounts_p(amounts_p);
        setDisAssetsnames_p(assetsnames_p);
        setDisAssetsnames_p_color(assetsnames_p_color);
        setDisAmounts_n(amounts_n);
        setDisAssetsnames_n_color(assetsnames_p_color)
        setDisAssetsnames_n(assetsnames_n);
        setDisExAmounts_p(Examounts_p);
        setDisExAssetsnames_p(Exassetsnames_p);
        setDisExAmounts_n(Examounts_n);
        setDisExAssetsnames_n(Exassetsnames_n);
        setDisUsernames(usernames);

      } catch (error) {
        console.log(error);
        setErrorMessages('エラーしました。');
      }
    };

    fetchData(); // 非同期関数を呼び出す
    // Chart.js の登録
    Chart.register(PieController, ArcElement, Tooltip, Legend);
    setFirstFlg(true);
  }, []);

  const SetAssetsData = (assets: any[]) => {
    let hozUserNo = -1;
    const usernames: string[] = [];

    let index = -1;
    const assetsnames_p: Assets[][] = [];
    const assetsnames_n: Assets[][] = [];

    // ユーザ情報ごとにデータを分ける
    assets.forEach((asset: any) => {
      if (hozUserNo !== asset.UserNo) {
        hozUserNo = asset.UserNo;
        usernames.push(asset.UserName);
        if (asset.Flg == 0) {
          assetsnames_p.push([{
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          }]);
          assetsnames_n.push([]);
        } else {
          assetsnames_p.push([]);
          assetsnames_n.push([{
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          }]);
        }
        index++;
      } else {
        if (asset.Flg == 0) {
          assetsnames_p[index].push({
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          });
        } else {
          assetsnames_n[index].push({
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          });
        }
      }
    });
    
    // セット
    setDisAssets_p(assetsnames_p);
    setDisAssets_n(assetsnames_n);
  }

  const MonthChange = (increment: number) => {
    const year = parseInt(DisDate.slice(0, 4), 10);
    const month = parseInt(DisDate.slice(4), 10);

    let newYear = year;
    let newMonth = month + increment;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setDisDate(`${newYear}${String(newMonth).padStart(2, '0')}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getstatisticsdata?date=' + DisDate, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        setTransactionData(data.transaction);
        setBeforeTransactionData(data.beforetransaction);
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

  useEffect(() => {
    if (isFirstFlg) {
      UpdateChart();
    }
  }, [isPageFlg, isFirstFlg, transactionData, beforeTransactionData, chartRefs]);

  const UpdateChart = () => {
    const IdArray: number[][] = [[], [], [], [], [], []];
    const NameArray: string[][] = [[], [], [], [], [], []];
    const ColorArray: string[][] = [[], [], [], [], [], []];
    const SumArray: number[][] = [[], [], [], [], [], []];
    //setStatisticsFlg([])

    let beforeInAmount = 0;
    let beforeOutAmount = 0;
    if (beforeTransactionData) {
      beforeTransactionData.forEach((transaction) => {
        if (transaction.Kind == 2){
          if(transaction.Excluded){
            if((transaction.Flg === 0 && transaction.flg_a1 === 1) || (transaction.Flg === 1 && transaction.flg_a1 === 0)){
              beforeOutAmount += transaction.Amount;
            }else{
              beforeInAmount += transaction.Amount;
            }
          }else{
            return;
          }
        }else if(transaction.Kind == 0){
          beforeInAmount += transaction.Amount;
        }else{
          beforeOutAmount += transaction.Amount;
        }
      })
    }

    let InAmount = 0;
    let OutAmount = 0;
    if (transactionData) {
      transactionData.forEach((transaction) => {
        let ind;
        if (transaction.Kind == 2){
          if(transaction.Excluded){
            if((transaction.Flg === 0 && transaction.flg_a1 === 1) || (transaction.Flg === 1 && transaction.flg_a1 === 0)){
              ind = 1;
              OutAmount += transaction.Amount;
            }else{
              ind = 0;
              InAmount += transaction.Amount;
            }
          }else{
            return;
          }
        }else if(transaction.Kind == 0){
          ind = 0;
          InAmount += transaction.Amount;
        }else{
          ind = 1;
          OutAmount += transaction.Amount;
        }
        //カテゴリの値設定
        const targetCategoryArray = transaction.CategoryID;
        const targetCategoryName = transaction.CategoryName as string;

        if (transaction.Kind == 2){
          if (!IdArray[ind].includes(transaction.AssetsID * -1)) {
            IdArray[ind].push(transaction.AssetsID * -1);
            NameArray[ind].push(transaction.AssetsName);
            SumArray[ind].push(transaction.Amount);
            ColorArray[ind].push(transaction.assets_backgroundcolor);
          } else {
            const index = IdArray[ind].indexOf(transaction.AssetsID * -1);
            SumArray[ind][index] += transaction.Amount;
          }
        }else{
          if (!IdArray[ind].includes(targetCategoryArray)) {
            IdArray[ind].push(targetCategoryArray);
            NameArray[ind].push(targetCategoryName);
            SumArray[ind].push(transaction.Amount);
            ColorArray[ind].push(transaction.category_backgroundcolor);
          } else {
            const index = IdArray[ind].indexOf(targetCategoryArray);
            SumArray[ind][index] += transaction.Amount;
          }
        }
        

        ind += 2
        //資産の値設定
        const targetAssetsArray = transaction.AssetsID;
        const targetAssetsName = transaction.AssetsName;

        if (!IdArray[ind].includes(targetAssetsArray)) {
          IdArray[ind].push(targetAssetsArray);
          NameArray[ind].push(targetAssetsName);
          SumArray[ind].push(transaction.Amount);
          ColorArray[ind].push(transaction.assets_backgroundcolor);
        } else {
          const index = IdArray[ind].indexOf(targetAssetsArray);
          SumArray[ind][index] += transaction.Amount;
        }
      });
    }

    let ind = 4;
    disAssetsnames_p[0]?.map((name, index) => {
      const amount = Number(disAmounts_p[0][index].replace(/,/g, "")) as number;
      //資産の値設定
      const targetCategoryName = name;

      if (!NameArray[ind].includes(name)) {
        NameArray[ind].push(targetCategoryName);
        SumArray[ind].push(amount);
        ColorArray[ind].push(disAssetsnames_p_color[0][index]);
      } else {
        const index = NameArray[ind].indexOf(name);
        SumArray[ind][index] += amount;
      }
    });

    ind = 5;
    disAssetsnames_n[0]?.map((name, index) => {
      const amount = Number(disAmounts_n[0][index].replace(/,/g, "")) as number;
      //資産の値設定
      const targetCategoryName = name;

      if (!NameArray[ind].includes(name)) {
        NameArray[ind].push(targetCategoryName);
        SumArray[ind].push(amount);
        ColorArray[ind].push(disAssetsnames_n_color[0][index]);
      } else {
        const index = NameArray[ind].indexOf(name);
        SumArray[ind][index] += amount;
      }
    })

    setNowInAmount(InAmount.toLocaleString())
    setNowOutAmount(OutAmount.toLocaleString())
    setCompareInAmount((InAmount - beforeInAmount).toLocaleString())
    setBeforeInAmount(beforeInAmount.toLocaleString())
    setBeforeOutAmount(beforeOutAmount.toLocaleString())
    setCompareOutAmount((OutAmount - beforeOutAmount).toLocaleString())
    setSumNowAmount((InAmount - OutAmount).toLocaleString())
    setSumBeforeAmount((beforeInAmount - beforeOutAmount).toLocaleString())
    setSumCompareAmount(((InAmount - OutAmount) - (beforeInAmount - beforeOutAmount)).toLocaleString())

    // 既存のグラフを破棄
    chartInstances.current.forEach((chart, i) => {
      if (chart) {
        chart.destroy();
        chartInstances.current[i] = null;
      }
    });

    const letStatisticsFlg:boolean[] = []
    for (let i = 0; i < SumArray.length; i++) {
      // SumArray[i] を降順に並び替え、対応する NameArray[i] も同じ順序に並び替える
      const sortedIndices = SumArray[i]
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value)
        .map(({ index }) => index);
    
      SumArray[i] = sortedIndices.map(index => SumArray[i][index]);
      NameArray[i] = sortedIndices.map(index => NameArray[i][index]);
      ColorArray[i] = sortedIndices.map(index => ColorArray[i][index]);

      if (NameArray[i].length === 0){
        letStatisticsFlg.push(false)
      }else{
        letStatisticsFlg.push(true)
      }
    }

    setStatisticsFlg(letStatisticsFlg)
    setNameArray(NameArray)
    setSumArray(SumArray)
    setColorArray(ColorArray)
  };

  useEffect(() => {
    // 新しいチャートを作成
    chartRefs.current.forEach((canvas, index) => {
      if (!canvas) return;
      
      const newChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: disNameArray[index],
          datasets: [
            {
              data: disSumArray[index],
              hoverOffset: 4,
              backgroundColor: disColorArray[index], // バーの色
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false }, // ラベル（凡例）を非表示
            tooltip: { enabled: false } // ツールチップを無効化
          }
        }
      });
    
      chartInstances.current[index] = newChart;
    });
  }, [disNameArray, disSumArray, disColorArray]);

  return (
    <div className="statistics-form">
      <div>
        <div className="statistics-header-month">
          <button onClick={() => MonthChange(-1)}>◀</button>
          <div>
            <span>{DisDate.slice(0, 4)}年</span>
            <span>{DisDate.slice(4)}月</span>
          </div>
          <button onClick={() => MonthChange(1)}>▶</button>
        </div>
        <div className="statistics-header">
          <button onClick={() => setPageFlg(1)} className={isPageFlg === 1 ? 'active' : ''}>
            資産統計
          </button>
          <button onClick={() => setPageFlg(2)} className={isPageFlg === 2 ? 'active' : ''}>
            カテゴリ統計
          </button>
        </div>

        {isPageFlg === 1 && (
          <div>
            <div className='StatisticsBody'>
              <div className="StatisticsHeader">
                <span className="StatisticsTotalAssetsTitle">先月比</span>
                <div className="StatisticsAssetsLiabilitiesWrapper">
                  <div className="StatisticsLiabilitiesWrapper">
                    <div className='StatisticsTitle'><span>収入</span></div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>先月</span>
                      <span className='StatisticsCompareRight'>¥ {beforeInAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>今月</span>
                      <span className='StatisticsCompareRight'>¥ {nowInAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>増減</span>
                      <span className={`StatisticsCompareRight ${compareInAmount.startsWith("-") ? "text-red" : "text-green"}`}>¥ {compareInAmount}</span>
                    </div>
                  </div>
                  <div className="StatisticsLiabilitiesWrapper">
                    <div className='StatisticsTitle'>
                      <span>支出</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>先月</span>
                      <span className='StatisticsCompareRight'>¥ {beforeOutAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>今月</span>
                      <span className='StatisticsCompareRight'>¥ {nowOutAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>増減</span>
                      <span className={`StatisticsCompareRight ${compareOutAmount.startsWith("-") ? "text-green" : "text-red"}`}>¥ {compareOutAmount}</span>
                    </div>
                  </div>
                  <div className="StatisticsLiabilitiesWrapper">
                    <div className='StatisticsTitle'>
                      <span>合計額</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>先月</span>
                      <span className='StatisticsCompareRight'>¥ {sumBeforeAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>今月</span>
                      <span className='StatisticsCompareRight'>¥ {sumNowAmount}</span>
                    </div>
                    <div className='StatisticsCompareBox'>
                      <span className='StatisticsCompareLeft'>増減</span>
                      <span className={`StatisticsCompareRight ${sumCompareAmount.startsWith("-") ? "text-red" : "text-green"}`}>¥ {sumCompareAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
              {StatisticsTransactionData.map((data, index) => (
                <div className='StatisticsBox' key={index}>
                  {StatisticsFlg[index] ? (
                    <>
                    <div className='StatisticsCircle'>
                      <div>{data}</div>
                      <canvas ref={(el) => (chartRefs.current[index] = el)} />
                    </div>
                    <div className="StatisticsAmountBox">
                      {disNameArray[index].map((name, i) => (
                        <div className='StatisticsAmount' key={index.toString() + i.toString()}>
                          <div>
                            <div className='StatisticsColorBox' style={{backgroundColor: disColorArray[index][i]}}></div>
                            <span>{name}</span>
                          </div>
                          <div>
                            <span>￥{disSumArray[index][i].toLocaleString().padStart(7, " ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    </>
                  ):(
                    <div>
                      <span>データなし</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isPageFlg === 2 && (
          <div>
            <div className='StatisticsBody'>
              <div className="StatisticsHeader">
                <span className="StatisticsTotalAssetsTitle">総資産額</span>
                <div className="StatisticsAssetsLiabilitiesWrapper">
                  <div className="StatisticsLiabilitiesWrapper">
                    <span className="StatisticsLiabilityTitle">資産</span>
                    <span className="StatisticsLiabilityAmount">¥ {disSubtotal_p[0]}</span>
                  </div>
                  <div className="StatisticsLiabilitiesWrapper">
                    <span className="StatisticsLiabilityTitle">負債</span>
                    <span className="StatisticsLiabilityAmount">¥ {disSubtotal_n[0]}</span>
                  </div>
                  <div className="StatisticsLiabilitiesWrapper">
                    <span className="StatisticsLiabilityTitle">合計</span>
                    <span className="StatisticsLiabilityAmount">¥ {disTotal}</span>
                  </div>
                </div>
              </div>
              {StatisticsAssetsData.map((data, index) => (
                <div className='StatisticsBox' key={index + 4}>
                  {StatisticsFlg[index + 4] ? (
                    <>
                    <div className='StatisticsCircle'>
                      <div>{data}</div>
                      <canvas ref={(el) => (chartRefs.current[index + 4] = el)} />
                    </div>
                    <div className="StatisticsAmountBox">
                      {disNameArray[index + 4].map((name, i) => (
                        <div className='StatisticsAmount' key={(index + 4).toString() + i.toString()}>
                          <div>
                            <div className='StatisticsColorBox' style={{backgroundColor: disColorArray[index + 4][i]}}></div>
                            <span>{name}</span>
                          </div>
                          <div>
                            <span>￥{disSumArray[index + 4][i].toLocaleString().padStart(7, " ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    </>
                  ):(
                    <div>
                      <span>データなし</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>{errorMessages}</div>
      </div>
    </div>
  );
};

export default Statistics;