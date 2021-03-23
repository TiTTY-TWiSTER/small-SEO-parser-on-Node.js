const axios = require('axios'); //для запроса 
const cheerio = require('cheerio'); // Jquery для Ноды
var fs = require('fs'); // модуль для записи в файл

var path = require('path')

// ЧИТАЕМ csv start//
const csv = require('csv-parser'); // модуль для чтения в csv
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // модуль для записи в csv

const results = [];

/* fs.createReadStream('all_films.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results[0]);
  }); */
// ЧИТАЕМ csv  end//


var arr_json = require('./for_export_datas/' + process.argv[2])//экспортируем данные из файла
var from_export = Array.from(new Set(arr_json.urls))//вырезание дублей из массива

var arr = [] // сюда будем добавлять ответ с каждого url

for(var i=0;i<from_export.length;i++){ // проходимся по Урлам

	let some = axios.get(from_export[i]).then((res)=>{ // делаем запрос для каждого
		return res.data	// возвращаем данные в переменную, НО это промис!
	})
	// создаем async функцию для извлечениях данных из промиса
	async function Back(url_string){ // url_string для передачи урлов в объект из цикла по массиву
		var oneD = await some // подождали промис
		var $ = cheerio.load(oneD) // передали html модулю cheerio
		

		function notAlone(data1){// данная функция для проверки пустых значений, что бы не было ошибок если элемент отсутствует на странице
			if(data1 != undefined && data1 != '' && data1.length > 0){
				return data1
			}else{
				return 'is empty!'
			}
		}
		
		// изнутри асинхронной функции, в которой есть результат промиса пушим данные
		arr.push({
			url:url_string,
			title:$('title').text(),
			length:$('title').text().length,
			description:notAlone($('meta[name="description"]').attr('content')),
			length_d:notAlone($('meta[name="description"]').attr('content')).length,
			h:notAlone($('h1').text()),
			length_h:notAlone($('h1').text()).length,
		})

		if(i == from_export.length){ // как только все запросы отработают и у нас будут все данные
			//fs.writeFileSync('./results_parsers/Bim_consult_titles.json', JSON.stringify(arr)); // записсываем в файл json

			// пишем в csv //
			const csvWriter = createCsvWriter({
			    path: './results_parsers/' + process.argv[3],
			    header: [
			    	{id: 'url', title: 'URL'},
			        {id: 'title', title: 'TITLE'},
			       	{id:'length',title:'LENGTH'},
					{id: 'description', title: 'DESCRIPTION'},
					{id: 'length_d', title: 'LENGTH_D'},
					{id: 'h', title: 'H1'},
					{id: 'length_h', title: 'LENGTH_H'}
			    ]
			});

			csvWriter.writeRecords(arr)
		    .then(() => {
		        console.log('...Done');
		    });
		}
	}
	Back(from_export[i])// вызов функции с передачей данных из цикла по массиву
}

// для чтения и проверки что записалось
const results2 = [];

setTimeout(function(){
	fs.createReadStream(`./results_parsers/${process.argv[3]}`)
  .pipe(csv())
  .on('data', (data) => results2.push(data))
  .on('end', () => {
    console.log(results2);
  });
},2000)