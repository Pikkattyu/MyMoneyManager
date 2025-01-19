import React, { useRef, useEffect } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

const Statistics: React.FC = () => {
    // Canvas要素への参照
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    // Chart.jsモジュールを登録
    useEffect(() => {
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
    }, []);

    // データを更新する関数
    const updateChartData = () => {
        if (chartInstanceRef.current) {
            const newData = Array.from({ length: 3 }, () => Math.floor(Math.random() * 500));

            // データを更新
            chartInstanceRef.current.data.datasets[0].data = newData;

            // グラフを再描画
            chartInstanceRef.current.update();
        }
    };

    return (
        <div>
            <canvas ref={chartRef} width="400" height="400"></canvas>
            <button onClick={updateChartData}>Update Data</button>
        </div>
    );
};

export default Statistics;