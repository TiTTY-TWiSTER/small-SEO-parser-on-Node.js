const axios = require('axios'); //для запроса 
const cheerio = require('cheerio'); // Jquery для Ноды
var fs = require('fs'); // модуль для записи в файл

// ЧИТАЕМ csv start//
const csv = require('csv-parser'); // модуль для чтения в csv
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // модуль для записи в csv

const results = [];

fs.createReadStream('all_films.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results[0]);
  });
// ЧИТАЕМ csv  end//

var url_arr = ['https://roseco.net',
'https://roseco.net/proektirovanie/proektirovanie-mediczinskix-uchrezhdeniy',
'https://roseco.net/proektirovanie/proektirovanie-ochistnyix-sooruzhenij']

var from_export = require('./for_export_datas/bim_consult.json')//экспортируем данные из файла

var arr = [] // сюда будем добавлять ответ с каждого url

for(var i=0;i<from_export.urls.length;i++){ // проходимся по Урлам

	let some = axios.get(from_export.urls[i]).then((res)=>{ // делаем запрос для каждого
		return res.data	// возвращаем данные в переменную, НО это промис!
	})
	// создаем async функцию для извлечениях данных из промиса
	async function Back(url_string){ // url_string для передачи урлов в объект из цикла по массиву
		var oneD = await some // подождали промис
		var $ = cheerio.load(oneD) // передали html модулю cheerio

		// изнутри асинхронной функции, в которой есть результат промиса пушим данные
		arr.push({
			url:url_string,
			title:$('title').text(),
			description:$('meta[name="description"]').attr('content'),
			h:$('h1').text()
		})

		if(i == from_export.urls.length){ // как только все запросы отработают и у нас будут все данные
			//fs.writeFileSync('./results_parsers/Bim_consult_titles.json', JSON.stringify(arr)); // записсываем в файл json

			// пишем в csv //
			const csvWriter = createCsvWriter({
			    path: './results_parsers/bimConsult.csv',
			    header: [
			    	{id: 'url', title: 'URL'},
			        {id: 'title', title: 'TITLE'},
			        {id: 'description', title: 'DESCRIPTION'},
			        {id: 'h', title: 'H1'}
			    ]
			});

			csvWriter.writeRecords(arr)
		    .then(() => {
		        console.log('...Done');
		    });
		}
	}
	Back(from_export.urls[i])// вызов функции с передачей данных из цикла по массиву
}

// для чтения и проверки что записалось
const results2 = [];

setTimeout(function(){
	fs.createReadStream('./results_parsers/bimConsult.csv')
  .pipe(csv())
  .on('data', (data) => results2.push(data))
  .on('end', () => {
    console.log(results2);
  });
},2000)