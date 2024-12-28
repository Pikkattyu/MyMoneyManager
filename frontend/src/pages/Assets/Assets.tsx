import React, { useEffect, useState } from 'react';
import CreateAssets from './CreateAssets';
import ChangeAssets from './ChangeAssets';
import DisAssets from './DisAssets';

interface Assets {
  AssetsID: number;
  UserID: number;
  UserName: string
  AssetsName: string;
  UpdateTime: Date;
}

const Asset: React.FC = () => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [disTotal, setDisTotal] = useState<string>('0');
  const [disSubtotal, setDisSubtotal] = useState<string[]>([]);
  const [disSubtotal_p, setDisSubtotal_p] = useState<string[]>([]);
  const [disAmounts_p, setDisAmounts_p] = useState<string[][]>([]);
  const [disSubtotal_n, setDisSubtotal_n] = useState<string[]>([]);
  const [disAmounts_n, setDisAmounts_n] = useState<string[][]>([]);
  const [disAssetsnames_p, setDisAssetsnames_p] = useState<string[][]>([]);
  const [disAssetsnames_n, setDisAssetsnames_n] = useState<string[][]>([]);
  const [disUsernames, setDisUsernames] = useState<string[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disAssetsID, setAssetsID] = useState<number>(0);

  const [isPageFlg, setPageFlg] = useState(0);

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

        const data = await response.json();
        const assets = data.data; // データを状態変数に格納

        let hozUserNo = -1;
        let usernames: string[] = [];

        let index = -1;
        let total = 0;
        let subtotal_p: number[] = [];
        let subtotal_p_conv: string[] = [];
        let amounts_p: string[][] = [];
        let assetsnames_p: string[][] = [];
        let subtotal_n: number[] = [];
        let subtotal_n_conv: string[] = [];
        let amounts_n: string[][] = [];
        let assetsnames_n: string[][] = [];

        let subtotal_conv: string[] = [];

        let CorrectVal: number;

        // ユーザ情報ごとにデータを分ける
        assets.forEach((asset: any) => {
          if (asset.Flg == 0) {
            CorrectVal = asset.Amount;
          } else {
            CorrectVal = asset.Amount * -1;
          }

          if (hozUserNo !== asset.UserNo) {
            hozUserNo = asset.UserNo;
            usernames.push(asset.UserName);
            if (asset.Flg == 0) {
              subtotal_p.push(asset.Amount);
              amounts_p.push([asset.Amount.toLocaleString()]);
              subtotal_n.push(0);
              amounts_n.push([]);
              assetsnames_p.push([asset.AssetsName]);
              assetsnames_n.push([]);
            } else {
              subtotal_p.push(0);
              amounts_p.push([]);
              subtotal_n.push(asset.Amount);
              amounts_n.push([asset.Amount.toLocaleString()]);
              assetsnames_p.push([]);
              assetsnames_n.push([asset.AssetsName]);
            }
            index++;
          } else {
            if (asset.Flg == 0) {
              amounts_p[index].push(asset.Amount.toLocaleString());
              subtotal_p[index] += asset.Amount;
              assetsnames_p[index].push(asset.AssetsName);
            } else {
              amounts_n[index].push(asset.Amount.toLocaleString());
              subtotal_n[index] += asset.Amount;
              assetsnames_n[index].push(asset.AssetsName);
            }
          }

          total += CorrectVal;
        });

        SetAssetsData(assets);

        // 小計を3桁コンマ区切りで保存
        subtotal_p_conv = subtotal_p.map(value => value.toLocaleString());
        subtotal_n_conv = subtotal_n.map(value => value.toLocaleString());
        subtotal_conv = subtotal_p.map((value, i) => (value - subtotal_n[i]).toLocaleString());

        // セット
        setDisTotal(total.toLocaleString());
        setDisSubtotal(subtotal_conv);
        setDisSubtotal_p(subtotal_p_conv);
        setDisAmounts_p(amounts_p);
        setDisAssetsnames_p(assetsnames_p);
        setDisSubtotal_n(subtotal_n_conv);
        setDisAmounts_n(amounts_n);
        setDisAssetsnames_n(assetsnames_n);
        setDisUsernames(usernames);

      } catch (error) {
        setErrorMessages('エラーしました。');
      }
    };

    fetchData();
  }, []);

  const SetAssetsData = (assets: any) => {
    let hozUserNo = -1;
    let usernames: string[] = [];

    let index = -1;
    let assetsnames_p: Assets[][] = [];
    let assetsnames_n: Assets[][] = [];

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

    setPageFlg(number);
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

            <div className="customHeaderWrapper">
              <span className="customHeaderTitle">使用者 {disUsernames[0]}</span>
              <span className="customHeaderAmount">¥ {disSubtotal[0]}</span>
            </div>

            <div className="customDetailsWrapper">
              <div className="customLeftSection">
                <div className="customDetailTitle-plus">資産</div>
                {disAssetsnames_p[0]?.map((name, index) => (
                  <div className="customDetailItem" key={index}>
                    <span className="customDetailLabel">{name}</span>
                    <span className="customDetailAmount">¥ {disAmounts_p[0][index]}</span>
                  </div>
                ))}
              </div>
              <div className="customRightSection">
                <div className="customDetailTitle-minus">負債</div>
                {disAssetsnames_n[0]?.map((name, index) => (
                  <div className="customDetailItem" key={index}>
                    <span className="customDetailLabel">{name}</span>
                    <span className="customDetailAmount">¥ {disAmounts_n[0][index]}</span>
                  </div>
                ))}
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
          <ChangeAssets onClose={ChangePage} />
        </>
      )}
    </div>
  );
};

export default Asset;