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

  const formatPerson = (person) => {
    return {
      'ФИО': `${person.surname} ${person.name} ${person.patronymic}`,
      'Дата рождения': format(new Date(person.birthday), 'dd.MM.yyyy'),
      'Пол': person.gender === 'M' ? 'Мужской' : 'Женский',
      'Образование': person.education,
      'Адрес': person.registration?.address || '-',
      'Документ': `${person.document?.document_type?.name || '-'} ${person.document?.series || '-'} ${person.document?.nomer || '-'}`,
      'Военный билет': person.military ? 'Есть' : 'Нет',
      'Работа': person.job?.place || '-'
    };
  };

  const processData = (rawData, reportIndex) => {
    switch (reportIndex) {
      case 0: // Список лиц
        return rawData.map(formatPerson);
      case 1: // Численность по возрасту
        const ageGroups = {};
        rawData.forEach(person => {
          const birthDate = new Date(person.birthday);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          ageGroups[age] = (ageGroups[age] || 0) + 1;
        });
        return Object.entries(ageGroups)
          .sort(([age1], [age2]) => Number(age1) - Number(age2))
          .map(([age, count]) => ({
            'Возраст': age,
            'Количество': count
          }));
      case 2: // До 18 лет
        const genderGroups = { M: {}, W: {} };
        rawData.forEach(person => {
          const birthDate = new Date(person.birthday);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            genderGroups[person.gender][age] = (genderGroups[person.gender][age] || 0) + 1;
          }
        });
        return Object.entries(genderGroups)
          .flatMap(([gender, ages]) =>
            Object.entries(ages)
              .sort(([age1], [age2]) => Number(age1) - Number(age2))
              .map(([age, count]) => ({
                'Пол': gender === 'M' ? 'Мужской' : 'Женский',
                'Возраст': age,
                'Количество': count
              })));
      case 3: // Воинский запас
        return rawData
          .filter(person => person.military)
          .map(person => ({
            'ФИО': `${person.surname} ${person.name} ${person.patronymic}`,
            'Дата рождения': format(new Date(person.birthday), 'dd.MM.yyyy'),
            'Звание': person.military.rank,
            'Категория': person.military.military_category,
            'Военный округ': person.military.military_district === 'army' ? 'РА' : 'ВМФ'
          }));
      case 4: // Военно-учетные признаки
        return rawData
          .filter(person => person.military && !person.military.called)
          .map(person => ({
            'ФИО': `${person.surname} ${person.name} ${person.patronymic}`,
            'Категория запаса': person.military.stock_category,
            'Военно-учетная специальность': person.military.military_account_type,
            'Звание': person.military.rank
          }));
      default:
        return [];
    }
  };

  const handleReportClick = async (index) => {
    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите период');
      return;
    }

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const noPagination = index !== 0 && index !== 3;
      const response = await fetchPeople(formattedStartDate, formattedEndDate, noPagination);
      
      const processedData = processData(noPagination ? response : response.results, index);
      setData(processedData);
      setActiveReport(index);
      setPage(0);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при получении данных');
    }
  };

  const handleExport = () => {
    if (!data.length) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report-${activeReport}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const renderTable = () => {
    if (!data.length) return null;

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
        {(activeReport === 0 || activeReport === 3) && (
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
            <Button variant="contained" onClick={handleExport}>
              Экспорт в Excel
            </Button>
            {renderTable()}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Reports;
