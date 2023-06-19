import './statistic.scss';
import { Bar } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale, BarElement } from 'chart.js';
import { useEffect, useState } from 'react';
import { httpGet } from '../../services';
import { Button } from 'antd';
import ExcelJS from 'exceljs';

Chart.register(LinearScale, CategoryScale, BarElement);

const options = {
  responsive: true, // Make the chart responsive
  maintainAspectRatio: false, // Disable aspect ratio to fill container
  plugins: {
    legend: {
      display: false // Hide the legend if not needed
    },
    title: {
      display: true,
      text: 'My Bar Chart', // Set the name for the chart
      font: {
        size: 16,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 30
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Thời gian' // Set the label for the X-axis
      }
    },
    y: {
      title: {
        display: true,
        text: 'Tổng doanh số', // Set the label for the Y-axis
        padding: {
          right: 30
        }
      }
    }
  }
};

const StatisticPage = () => {
  const [invoicesList, setInvoicesList] = useState([]);
  const [chartDataType, setChartDataType] = useState('all');
  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await httpGet('/invoices');

      setInvoicesList(data || []);
    };

    fetchInvoices();
  }, []);

  const getChartData = type => {
    let data = {};

    switch (type) {
      case 'month':
        data = invoicesList.reduce((acc, obj) => {
          const date = new Date(obj.InvoiceDate);
          const month = date.getMonth() + 1; // Month number (1-based)
          const year = date.getFullYear();
          const key = `${month}/${year}`;

          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += parseFloat(obj.Total);

          return acc;
        }, {});
        break;

      case 'year':
        data = invoicesList.reduce((acc, obj) => {
          const year = new Date(obj.InvoiceDate).getFullYear();

          if (!acc[year]) {
            acc[year] = 0;
          }

          acc[year] += parseFloat(obj.Total);
          return acc;
        }, {});
        break;

      default:
        data = invoicesList.reduce((accumulator, invoice) => {
          const invoiceDate = new Date(invoice.InvoiceDate).toLocaleDateString();
          const total = parseInt(invoice.Total);

          if (Object.prototype.hasOwnProperty.call(accumulator, invoiceDate)) {
            accumulator[invoiceDate] += total;
          } else {
            accumulator[invoiceDate] = total;
          }

          return accumulator;
        }, {});
        break;
    }

    const labels = Object.keys(data);
    const datasets = Object.values(data);

    return { labels, datasets };
  };

  const handleCreateExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    const combinedData = getChartData(chartDataType).labels.reduce((acc, date, index) => {
      acc[date] = getChartData(chartDataType).datasets[index];
      return acc;
    }, {});

    worksheet.getCell('A1').value = 'Thời gian';
    worksheet.getCell('B1').value = 'Doanh thu';

    // Add data rows
    let rowIndex = 2;
    for (const [date, value] of Object.entries(combinedData)) {
      worksheet.getCell(`A${rowIndex}`).value = date;
      worksheet.getCell(`B${rowIndex}`).value = value;
      rowIndex++;
    }

    // Set column widths
    worksheet.getColumn('A').width = 15;
    worksheet.getColumn('B').width = 10;

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'thongke.xlsx';
      link.click();
    });
  };

  const data = {
    labels: getChartData(chartDataType).labels,
    datasets: [
      {
        data: getChartData(chartDataType).datasets,
        backgroundColor: 'rgba(24, 144, 255, 0.5)', // Customize the bar color
        borderColor: 'rgba(24, 144, 255, 1)', // Customize the bar border color
        borderWidth: 1 // Customize the bar border width
      }
    ]
  };

  return (
    <div className="statistic__container">
      <div className="statistic__title">Bảng thống kê chi phí</div>
      <div className="statistic__filter">
        <Button type="primary" onClick={handleCreateExcel}>
          Tải excel
        </Button>
        <select value={chartDataType} onChange={e => setChartDataType(e.target.value)} className="statistic__select">
          <option value="all" className="statistic__option">
            Tất cả
          </option>
          <option value="month" className="statistic__option">
            Tháng
          </option>
          <option value="year" className="statistic__option">
            Năm
          </option>
        </select>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default StatisticPage;
