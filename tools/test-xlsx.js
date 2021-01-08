const inputFilename = 'Afgang Efteråret 2020_inkl forsinkede.xlsx'


const XLSX = require('xlsx');

const workBook = XLSX.readFile(inputFilename);
XLSX.writeFile(workBook, inputFilename+'.csv', { bookType: "csv" });
