import React, { useEffect, useState } from 'react';
import CreateAssets from './CreateAssets';
import ChangeAssets from './ChangeAssets';
import DisAssets from './SelAssets';

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
  MovePageFlg: number;
}

interface Assets {
  AssetsID: number;
  UserID: number;
  UserName: string
  AssetsName: string;
  UpdateTime: Date;
}

const Asset: React.FC<OpenButtonProps> = ({ onClose, MovePageFlg }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');

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
  const [disAssetsnames_n, setDisAssetsnames_n] = useState<string[][]>([]);
  //資産非計上
  const [disExAssetsnames_p, setDisExAssetsnames_p] = useState<string[][]>([]);
  const [disExAssetsnames_n, setDisExAssetsnames_n] = useState<string[][]>([]);
  const [disExAmounts_p, setDisExAmounts_p] = useState<string[][]>([]);
  const [disExAmounts_n, setDisExAmounts_n] = useState<string[][]>([]);

  const [disUsernames, setDisUsernames] = useState<string[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disAssetsID, setAssetsID] = useState<number>(0);

  //表示内容切り替えフラグ
  const [isPageFlg, setPageFlg] = useState(MovePageFlg || 0);
  const [isStartFlg] = useState(MovePageFlg || 0);
  
  const [isShowZeroAmountItems, setShowZeroAmountItems] = useState<boolean>(false);
  const [isShowZeroAmountItemsHidden, setShowZeroAmountItemsHidden] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getassetsall', {
          method: 'GET',
        });

        if (!response.ok) {
          setErrorMessages('資産情報の取得時にエラーしました。');
          return;
        }

        if (localStorage.getItem('ShowZeroAmountItems') === 'true'){
          setShowZeroAmountItemsHidden(true)
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
        const assetsnames_n: string[][] = [];

        const Examounts_p: string[][] = [];
        const Examounts_n: string[][] = [];
        const Exassetsnames_p: string[][] = [];
        const Exassetsnames_n: string[][] = [];

        let subtotal_conv: string[] = [];

        let CorrectVal: number;

        // ユーザ情報ごとにデータを分ける
        assets.forEach((asset: any) => {
          CorrectVal = 0
          transactions.forEach((transaction: any) => {
            if(asset.AssetsID === transaction.AssetsID){
              if(transaction.Kind === 0){
                if(transaction.flg_a1 === 0){
                  CorrectVal += transaction.Amount
                }else{
                  CorrectVal -= transaction.Amount
                }
              }else if(transaction.Kind === 1){
                if(transaction.flg_a1 === 0){
                  CorrectVal -= transaction.Amount
                }else{
                  CorrectVal += transaction.Amount
                }
              }else{
                if(transaction.flg_a1 === 0){
                  if(transaction.Flg === 0){
                    CorrectVal -= transaction.Amount
                  }else{
                    CorrectVal += transaction.Amount
                  }
                }else{
                  if(transaction.Flg === 0){
                    CorrectVal += transaction.Amount
                  }else{
                    CorrectVal -= transaction.Amount
                  }
                }
                
              }
            }
          })
          CorrectVal += asset.Amount;

          if (hozUserNo !== asset.UserNo) {
            hozUserNo = asset.UserNo;
            usernames.push(asset.UserName);
            if (asset.Flg == 0) {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded){
                subtotal_p.push(0)
                
                //資産計上は空
                amounts_p.push([]);
                assetsnames_p.push([]);

                //資産非計上に値を入れる
                Examounts_p.push([CorrectVal.toLocaleString()]);
                Exassetsnames_p.push([asset.AssetsName]);
              }else{
                subtotal_p.push(CorrectVal);

                //資産計上に値を入れる
                amounts_p.push([CorrectVal.toLocaleString()]);
                assetsnames_p.push([asset.AssetsName]);

                //資産非計上は空
                Examounts_p.push([]);
                Exassetsnames_p.push([]);
              }
              subtotal_n.push(0);
              amounts_n.push([]);
              assetsnames_n.push([]);
              Examounts_n.push([]);
              Exassetsnames_n.push([]);
            } else {
              //資産非計上の場合、合計額に含まない
              if (asset.Excluded){
                subtotal_n.push(0)
                
                //資産計上は空
                amounts_n.push([]);
                assetsnames_n.push([]);

                //資産非計上に値を入れる
                Examounts_n.push([CorrectVal.toLocaleString()]);
                Exassetsnames_n.push([asset.AssetsName]);
              }else{
                subtotal_n.push(CorrectVal);

                //資産計上に値を入れる
                amounts_n.push([CorrectVal.toLocaleString()]);
                assetsnames_n.push([asset.AssetsName]);

                //資産非計上は空
                Examounts_n.push([]);
                Exassetsnames_n.push([]);
              }
              subtotal_p.push(0);
              amounts_p.push([]);
              assetsnames_p.push([]);
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
              }
            }
          }

          //資産非計上の場合、合計額に含まない
          if (!asset.Excluded){
            if(asset.Flg == 0){
              total += CorrectVal;
            }else{
              total -= CorrectVal;
            }
          }
        });

        SetAssetsData(assets);

        // 小計を3桁コンマ区切りで保存
        subtotal_p_conv = subtotal_p.map(value => value.toLocaleString());
        subtotal_n_conv = subtotal_n.map(value => value.toLocaleString());
        subtotal_conv = subtotal_p.map((value, i) => (value - subtotal_n[i]).toLocaleString());

        // セット
        //合計
        setDisTotal(total.toLocaleString());
        //ユーザごと合計
        setDisSubtotal(subtotal_conv);
        //ユーザごと資産/負債
        setDisSubtotal_p(subtotal_p_conv);
        setDisSubtotal_n(subtotal_n_conv);
        //ユーザごと資産名_資産額/負債名_負債額
        setDisAmounts_p(amounts_p);
        setDisAssetsnames_p(assetsnames_p);
        setDisAmounts_n(amounts_n);
        setDisAssetsnames_n(assetsnames_n);
        //ユーザごと資産名_資産額/負債名_負債額（資産非計上）
        setDisExAmounts_p(Examounts_p);
        setDisExAssetsnames_p(Exassetsnames_p);
        setDisExAmounts_n(Examounts_n);
        setDisExAssetsnames_n(Exassetsnames_n);
        //ユーザ名
        setDisUsernames(usernames);

      } catch (error) {
        setErrorMessages('エラーしました。');
      }
      
    };

    fetchData();
  }, [isPageFlg]);

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

  const ChangePage = (button: boolean, number: number, index: number) => {
    if (button) {
      if (index == 0) {
        alert("新規登録しました。")
      } else {
        alert("変更しました。")
      }
    } else {
      if (index !== 0) {
        setAssetsID(index);
      }
    }
    if (number == 0 && isStartFlg == 1) {
      onClose(false)
    } else {
      setPageFlg(number);
    }
  };

  return (

    <div>
      {isPageFlg == 0 && (
        <>
          <div className='errorMessage'>{errorMessages}</div>
          <div className="customContainer">
            <div className="customTotalAssetsWrapper">
              <h2 className="customTotalAssetsTitle">総資産額</h2>
              <span className="customTotalAmount">¥ {disTotal}</span>
              <div className="customAssetsLiabilitiesWrapper">
                <div className="customAssetsWrapper">
                  <span className="customAssetTitle">資産</span>
                  <span className="customAssetAmount">¥ {disSubtotal_p[0]}</span>
                </div>
                <div className="customLiabilitiesWrapper">
                  <span className="customLiabilityTitle">負債</span>
                  <span className="customLiabilityAmount">¥ {disSubtotal_n[0]}</span>
                </div>
              </div>
            </div>

            {isShowZeroAmountItemsHidden &&(
              <div>
                <span className='UserSettingLabel'>0円の項目を資産一覧表示しない</span>
                <input
                  className='TransactionValue'
                  type="checkbox"
                  checked={isShowZeroAmountItems}
                  onChange={(e) => setShowZeroAmountItems(Boolean(e.target.checked))}
                />
              </div>
            )}
            <div className="customHeaderWrapper">
              <span className="customHeaderTitle">使用者 {disUsernames[0]}</span>
              <span className="customHeaderAmount">¥ {disSubtotal[0]}</span>
            </div>

            <div className="customDetailsWrapper">
              <div className="customLeftSection">
                <div className="customDetailTitle-plus">資産</div>
                {disAssetsnames_p[0]?.length > 0 && (
                  <>
                    <div className='littleHeader'>資産計上</div>
                  </>
                )}
                {disAssetsnames_p[0]?.map((name, index) => {
                  const amount = disAmounts_p[0]?.[index];
                  if (!(amount === "0" && isShowZeroAmountItems)) {
                    return (
                      <div className="customDetailItem" key={index}>
                        <span className="customDetailLabel">{name}</span>
                        <span className="customDetailAmount">¥ {amount}</span>
                      </div>
                    );
                  }
                  return null; // 条件を満たさない場合は何もレンダリングしない
                })}
                {disExAssetsnames_p[0]?.length > 0 && (
                  <>
                    <div className='littleHeader'>資産非計上</div>
                  </>
                )}
                {disExAssetsnames_p[0]?.map((name, index) => {
                  const amount = disExAmounts_p[0]?.[index];
                  if (!(amount === "0" && isShowZeroAmountItems)) {
                    return (
                      <div className="customDetailItem" key={index}>
                        <span className="customDetailLabel">{name}</span>
                        <span className="customDetailAmount">¥ {amount}</span>
                      </div>
                    );
                  }
                  return null; // 条件を満たさない場合は何もレンダリングしない
                })}
              </div>
              <div className="customRightSection">
                <div className="customDetailTitle-minus">負債</div>
                {disAssetsnames_n[0]?.length > 0 && (
                  <>
                    <div className='littleHeader'>負債計上</div>
                  </>
                )}
                {disAssetsnames_n[0]?.map((name, index) => {
                  const amount = disAmounts_n[0]?.[index];
                  if (!(amount === "0" && isShowZeroAmountItems)) {
                    return (
                      <div className="customDetailItem" key={index}>
                        <span className="customDetailLabel">{name}</span>
                        <span className="customDetailAmount">¥ {amount}</span>
                      </div>
                    );
                  }
                  return null; // 条件を満たさない場合は何もレンダリングしない
                })}
                {disExAssetsnames_n[0]?.length > 0 && (
                  <>
                    <div className='littleHeader'>負債非計上</div>
                  </>
                )}
                {disExAssetsnames_n[0]?.map((name, index) => {
                  const amount = disExAmounts_n[0]?.[index];
                  if (!(amount === "0" && isShowZeroAmountItems)) {
                    return (
                      <div className="customDetailItem" key={index}>
                        <span className="customDetailLabel">{name}</span>
                        <span className="customDetailAmount">¥ {amount}</span>
                      </div>
                    );
                  }
                  return null; // 条件を満たさない場合は何もレンダリングしない
                })}
              </div>
            </div>
            <div>
              <button className='btn-style' onClick={() => ChangePage(false, 1, 0)}>資産設定</button>
            </div>
          </div>
        </>
      )}

      {isPageFlg == 1 && (
        <>
          <div className='overlay'></div>
          <DisAssets
            disAssets_p={disAssets_p}
            disAssets_n={disAssets_n}
            onClose={ChangePage} />
        </>
      )}

      {isPageFlg == 2 && (
        <>
          <div className='overlay'></div>
          <CreateAssets onClose={ChangePage} />
        </>
      )}

      {isPageFlg == 3 && (
        <>
          <div className='overlay'></div>
          <ChangeAssets
            AssetsID={disAssetsID}
            onClose={ChangePage} />
        </>
      )}
    </div>
  );
};

export default Asset;