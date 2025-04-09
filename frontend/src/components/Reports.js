import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';

import Box from '@mui/material/Box';
import * as XLSX from 'xlsx';

import { fetchPeople } from '../services/api';

const REPORTS = [
  'Список лиц, проживающих на территории',
  'Численность населения по возрасту',
  'Справка о численности населения до 18 лет',
  'Учет граждан в воинском запасе',
  'Характеристика военно-учетных признаков'
];

const Reports = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const getRankDisplay = (rank) => {
    const ranks = {
      'private': 'Рядовой',
      'corporal': 'Ефрейтор',
      'junior_sergeant': 'Младший сержант',
      'sergeant': 'Сержант',
      'senior_sergeant': 'Старший сержант',
      'chief': 'Старшина',
      'warrant_officer': 'Прапорщик',
      'senior_warrant_officer': 'Старший прапорщик'
    };
    return ranks[rank] || '-';
  };

  const getMilitaryPersonnelDisplay = (personnel) => {
    const types = {
      'warrant': 'Прапорщик (мичман)',
      'sergeant': 'Сержант (старшина)',
      'soldier': 'Солдат (матрос)'
    };
    return types[personnel] || '-';
  };

  const getAccountTypeDisplay = (type) => {
    return type === 'general' ? 'Общий' : 'Специальный';
  };

  const processData = (rawData, reportIndex) => {
    switch (reportIndex) {
      case 0:
        return rawData.map(person => ({
          'ФИО': `${person.surname} ${person.name} ${person.patronymic}`,
          'Дата рождения': format(new Date(person.birthday), 'dd.MM.yyyy')
        }));
      case 1: {
        const ageRanges = [
          { name: 'До 1 года', min: 0, max: 1 },
          { name: 'С 1 года до 2 лет', min: 1, max: 2 },
          { name: 'С 2 лет до 3 лет', min: 2, max: 3 },
          { name: 'С 3 лет до 5 лет', min: 3, max: 5 },
          { name: 'С 5 лет до 7 лет', min: 5, max: 7 },
          { name: 'С 7 лет до 14 лет', min: 7, max: 14 },
          { name: 'С 14 лет до 16 лет', min: 14, max: 16 },
          { name: 'С 16 лет до 18 лет', min: 16, max: 18 },
          { name: 'С 18 лет до 20 лет', min: 18, max: 20 },
          { name: 'С 20 лет до 24 лет', min: 20, max: 24 },
          { name: 'С 24 лет до 28 лет', min: 24, max: 28 },
          { name: 'С 28 лет до 30 лет', min: 28, max: 30 },
          { name: 'С 30 лет до 35 лет', min: 30, max: 35 },
          { name: 'С 35 лет до 40 лет', min: 35, max: 40 },
          { name: 'С 40 лет до 45 лет', min: 40, max: 45 },
          { name: 'С 45 лет до 50 лет', min: 45, max: 50 },
          { name: 'С 50 лет до 55 лет', min: 50, max: 55 },
          { name: 'С 55 лет до 60 лет', min: 55, max: 60 },
          { name: 'С 60 лет до 65 лет', min: 60, max: 65 },
          { name: 'С 65 лет до 70 лет', min: 65, max: 70 },
          { name: 'Старше 70 лет', min: 70, max: Infinity }
        ];

        const counts = {
          M: Array(ageRanges.length).fill(0),
          W: Array(ageRanges.length).fill(0)
        };
        let totalM = 0;
        let totalW = 0;

        rawData.forEach(person => {
          const birthDate = new Date(person.birthday);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const gender = person.gender;

          const rangeIndex = ageRanges.findIndex(range => age >= range.min && age < range.max);
          if (rangeIndex !== -1) {
            counts[gender][rangeIndex]++;
            if (gender === 'M') totalM++;
            else totalW++;
          }
        });

        const result = ageRanges.map((range, index) => ({
          'Возрастная группа': range.name,
          'Мужчины': counts['M'][index],
          'Женщины': counts['W'][index],
          'Всего': counts['M'][index] + counts['W'][index]
        }));

        result.push({
          'Возрастная группа': 'Всего',
          'Мужчины': totalM,
          'Женщины': totalW,
          'Всего': totalM + totalW
        });

        return result;
      }
      case 2: {
        const ageGroups = [
          { name: 'До 3 лет и младше', max: 3 },
          { name: 'До 7 лет и младше', max: 7 },
          { name: 'До 14 лет и младше', max: 14 },
          { name: 'До 16 лет и младше', max: 16 },
          { name: 'До 18 лет и младше', max: 18 }
        ];

        const counts = {
          M: Array(ageGroups.length).fill(0),
          W: Array(ageGroups.length).fill(0)
        };

        rawData.forEach(person => {
          const birthDate = new Date(person.birthday);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const gender = person.gender;

          for (let i = 0; i < ageGroups.length; i++) {
            if (age < ageGroups[i].max) {
              counts[gender][i]++;
            }
          }
        });

        return ageGroups.map((group, index) => ({
          'Возрастная группа': group.name,
          'Мужчины': counts['M'][index],
          'Женщины': counts['W'][index],
          'Всего': counts['M'][index] + counts['W'][index]
        }));
      }
      case 3: { 
        let counter = 1;
        return rawData
          .filter(person => person.military && !person.military.called)
          .map(person => ({
            '№ п/п': counter++,
            'Фамилия': person.surname || '-',
            'Имя': person.name || '-',
            'Отчество': person.patronymic || '-',
            'Воинский разряд': person.military.military_category ? `${person.military.military_category}` : '-',
            'Категория запаса': person.military.stock_category ? `${person.military.stock_category}` : '-',
            'Воинский состав': getMilitaryPersonnelDisplay(person.military.rank),
            'Воинское звание': getRankDisplay(person.military.soldier_rank),
            'Группа учета': person.military.military_district === 'army' ? 'РА' : 'ВМФ',
            'Вид воинского учета': getAccountTypeDisplay(person.military.military_account_type)
          }));
      }
      case 4: { 
        const militaryPersonnel = ['warrant', 'sergeant', 'soldier'];
        const categories = [1, 2, 3];
        
        const result = [
          ['Разряды', 'Состав', 'Всего', '', '', 'В т.ч. на общем учете', '', '', 'В т.ч. на специальном учете', '', ''],
          ['', '', 'РА', 'ВМФ', 'Всего', 'РА', 'ВМФ', 'Всего', 'РА', 'ВМФ', 'Всего']
        ];

        const militaryData = rawData.filter(person => person.military && !person.military.called);

        const getCounts = (category, personnel, accountType = null, gender = null) => {
          const armyCount = militaryData.filter(p => 
            (category === null || p.military.military_category === category) &&
            (personnel === null || p.military.rank === personnel) &&
            p.military.military_district === 'army' &&
            (accountType === null || p.military.military_account_type === accountType) &&
            (gender === null || p.gender === gender)
          ).length;

          const navyCount = militaryData.filter(p => 
            (category === null || p.military.military_category === category) &&
            (personnel === null || p.military.rank === personnel) &&
            p.military.military_district === 'navy' &&
            (accountType === null || p.military.military_account_type === accountType) &&
            (gender === null || p.gender === gender)
          ).length;

          return [armyCount, navyCount, armyCount + navyCount];
        };

        // Мужчины
        for (const category of categories) {
          result.push([`${category} разряд`, 'Всего', 
            ...getCounts(category, null, null, 'M'),
            ...getCounts(category, null, 'general', 'M'),
            ...getCounts(category, null, 'special', 'M')
          ]);

          for (const personnel of militaryPersonnel) {
            result.push([
              '',
              getMilitaryPersonnelDisplay(personnel),
              ...getCounts(category, personnel, null, 'M'),
              ...getCounts(category, personnel, 'general', 'M'),
              ...getCounts(category, personnel, 'special', 'M')
            ]);
          }
        }

        // Женщины
        result.push(['Женщины', 'Всего', 
          ...getCounts(null, null, null, 'W'),
          ...getCounts(null, null, 'general', 'W'),
          ...getCounts(null, null, 'special', 'W')
        ]);

        for (const personnel of militaryPersonnel) {
          result.push([
            '',
            getMilitaryPersonnelDisplay(personnel),
            ...getCounts(null, personnel, null, 'W'),
            ...getCounts(null, personnel, 'general', 'W'),
            ...getCounts(null, personnel, 'special', 'W')
          ]);
        }

        return result;
      }
      default:
        return [];
    }
  };

  const loadAllPages = async (startDate, endDate) => {
    let allData = [];
    let nextPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetchPeople(startDate, endDate, nextPage, false);
      allData = [...allData, ...response.results];
      hasMore = response.next !== null;
      nextPage += 1;
    }

    return allData;
  };

  const handleReportClick = async (index) => {
    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите период');
      return;
    }

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      let response;
      let processedData;

      if (index === 0 || index === 3) {
        response = await fetchPeople(formattedStartDate, formattedEndDate, 1, false);
        processedData = processData(response.results, index);
      } else {
        response = await fetchPeople(formattedStartDate, formattedEndDate, 1, true);
        processedData = processData(response, index);
      }

      setData(processedData);
      setActiveReport(index);
      setPage(0);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при получении данных');
    }
  };

  const handleExport = async () => {
    if (!data.length || !startDate || !endDate) return;

    try {
      setIsExporting(true);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const displayStartDate = format(startDate, 'dd.MM.yyyy');
      const displayEndDate = format(endDate, 'dd.MM.yyyy');

      let exportData;
      // Always load all data without pagination for exports
      const allData = await loadAllPages(formattedStartDate, formattedEndDate);
      if (activeReport === 0 || activeReport === 3) {
        exportData = processData(allData, activeReport);
      } else {
        // For other reports, we'll still process all data to ensure complete export
        exportData = processData(allData, activeReport);
      }

      const wb = XLSX.utils.book_new();
      let ws;
      
      const reportTitle = REPORTS[activeReport];
      const titleWithDateRange = `${reportTitle} с ${displayStartDate} по ${displayEndDate}`;
      
      if (activeReport === 1) {
        ws = XLSX.utils.aoa_to_sheet([
          [titleWithDateRange],
          [],
          ['Возрастная группа', 'Мужчины', 'Женщины', 'Всего'],
          ...exportData.map(row => [
            row['Возрастная группа'],
            row['Мужчины'],
            row['Женщины'],
            row['Всего']
          ])
        ]);
        
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
      } else if (activeReport === 2) {
        const headers = [
          'Возрастная группа', 'Мужчины', 'Женщины', 'Всего'
        ];
        ws = XLSX.utils.aoa_to_sheet([
          [titleWithDateRange],
          [],
          headers,
          ...exportData.map(row => headers.map(header => row[header]))
        ]);
        
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
      } else if (activeReport === 3) {
        const headers = [
          '№ п/п', 'Фамилия', 'Имя', 'Отчество', 'Воинский разряд', 
          'Категория запаса', 'Воинский состав', 'Воинское звание', 'Группа учета', 'Вид воинского учета'
        ];
        ws = XLSX.utils.aoa_to_sheet([
          [titleWithDateRange],
          [],
          headers,
          ...exportData.map(row => headers.map(header => row[header]))
        ]);
        
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
      } else if (activeReport === 4) {
        ws = XLSX.utils.aoa_to_sheet([
          [titleWithDateRange],
          [],
          ['Разряды', 'Состав', 'Всего', '', '', 'В т.ч. на общем учете', '', '', 'В т.ч. на специальном учете', '', ''],
          ['', '', 'РА', 'ВМФ', 'Всего', 'РА', 'ВМФ', 'Всего', 'РА', 'ВМФ', 'Всего'],
          ...exportData.slice(2)
        ]);

        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push(
          // Title merges
          { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
          // Header row merges
          { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, // Разряды (height 2)
          { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } }, // Состав (height 2)
          { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }, // First "Всего" group
          { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } }, // "В т.ч. на общем учете" group 
          { s: { r: 2, c: 8 }, e: { r: 2, c: 10 } }  // "В т.ч. на специальном учете" group
        );
        
        // Calculate row numbers for each category (adjusted for the added header rows)
        const firstCategoryStart = 4;
        const secondCategoryStart = firstCategoryStart + 4;
        const thirdCategoryStart = secondCategoryStart + 4;
        const womenStart = thirdCategoryStart + 4;

        // Add category merges
        ws['!merges'].push(
          // First category merges
          { s: { r: firstCategoryStart, c: 0 }, e: { r: firstCategoryStart + 3, c: 0 } },
          // Second category merges
          { s: { r: secondCategoryStart, c: 0 }, e: { r: secondCategoryStart + 3, c: 0 } },
          // Third category merges
          { s: { r: thirdCategoryStart, c: 0 }, e: { r: thirdCategoryStart + 3, c: 0 } },
          // Women category merges
          { s: { r: womenStart, c: 0 }, e: { r: womenStart + 3, c: 0 } }
        );
      } else {
        // Report 0: Список лиц
        const headers = ['ФИО', 'Дата рождения'];
        ws = XLSX.utils.aoa_to_sheet([
          [titleWithDateRange],
          [],
          headers,
          ...exportData.map(row => headers.map(header => row[header]))
        ]);
        
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
      }

      const titleStyle = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };

      const headerStyle = {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        },
        fill: {
          fgColor: { rgb: "E0E0E0" }
        }
      };

      const cellStyle = {
        alignment: { horizontal: 'left', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };

      // Apply styles to all cells
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!ws[cell_ref]) continue;

          // Apply appropriate style based on row
          if (R === 0) {
            ws[cell_ref].s = titleStyle;
          } else if (R === 2 || R === 3) {
            ws[cell_ref].s = headerStyle;
          } else {
            ws[cell_ref].s = cellStyle;
          }
        }
      }

      // Set column widths and row heights
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 30 }; // Title row height
      
      if (activeReport === 4) {
        // Set row heights for the header rows in report 4
        ws['!rows'][2] = { hpt: 25 }; // First header row
        ws['!rows'][3] = { hpt: 25 }; // Second header row
      }
      
      // Set column widths based on report type
      if (activeReport === 0) {
        ws['!cols'] = [
          { wch: 40 },
          { wch: 15 }
        ];
      } else if (activeReport === 1) {
        ws['!cols'] = [
          { wch: 30 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
        ];
      } else if (activeReport === 2) {
        ws['!cols'] = [
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
        ];
      } else if (activeReport === 3) {
        ws['!cols'] = [
          { wch: 5 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
        ];
      } else if (activeReport === 4) {
        ws['!cols'] = [
          { wch: 20 },
          { wch: 25 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 }
        ];
      }

      let sheetName, fileName;
      
      if (activeReport === 0) {
        sheetName = 'Список лиц';
        fileName = `Список лиц ${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
      } else if (activeReport === 1) {
        sheetName = 'Численность';
        fileName = `Численность населения по возрасту ${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
      } else if (activeReport === 2) {
        sheetName = 'До 18 лет';
        fileName = `Справка о численности населения до 18 лет ${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
      } else if (activeReport === 3) {
        sheetName = 'Воинский учет';
        fileName = `Учет граждан в воинском запасе ${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
      } else if (activeReport === 4) {
        sheetName = 'Военно-учетные признаки';
        fileName = `Характеристика военно-учетных признаков ${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTable = () => {
    if (!data.length) return null;

    if (activeReport === 4) {
      return (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ fontWeight: 'bold', fontSize: '1.1em', py: 2 }}>
                    {data[0][0]}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold' }}>Всего</TableCell>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold' }}>В т.ч. на общем учете</TableCell>
                  <TableCell colSpan={3} align="center" sx={{ fontWeight: 'bold' }}>В т.ч. на специальном учете</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Разряды</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Состав</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>РА</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>ВМФ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Всего</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>РА</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>ВМФ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Всего</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>РА</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>ВМФ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Всего</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(2).map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, cellIndex) => (
                      <TableCell 
                        key={cellIndex}
                        align={cellIndex > 1 ? 'center' : 'left'}
                        sx={{
                          fontWeight: String(cell || '').includes('разряд') || cell === 'Женщины' ? 'bold' : 'normal',
                          pl: cell === '' ? 4 : 2,
                          py: 1.5
                        }}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      );
    }

    const columns = Object.keys(data[0]).map(key => ({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1)
    }));

    const paginatedData = activeReport === 0 || activeReport === 3
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!isExporting && (activeReport === 0 || activeReport === 3) && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} container spacing={2}>
          <Grid item>
            <DatePicker
              label="Начало периода"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="dd.MM.yyyy"
              slotProps={{
                textField: {
                  inputProps: {
                    'aria-label': 'Выбрать начальную дату'
                  }
                },
                popper: {
                  modifiers: [{ name: 'arrow', enabled: false }]
                }
              }}
            />
          </Grid>
          <Grid item>
            <DatePicker
              label="Конец периода"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="dd.MM.yyyy"
              minDate={startDate || undefined}
              slotProps={{
                textField: {
                  inputProps: {
                    'aria-label': 'Выбрать конечную дату'
                  }
                },
                popper: {
                  modifiers: [{ name: 'arrow', enabled: false }]
                }
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {REPORTS.map((report, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Button
                  variant={activeReport === index ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => handleReportClick(index)}
                >
                  {report}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {data.length > 0 && (
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={isExporting}
              sx={{ mb: 2 }}
            >
              {isExporting ? 'Экспорт...' : 'Экспорт в Excel'}
            </Button>
            {renderTable()}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Reports;
