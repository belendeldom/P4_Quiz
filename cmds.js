const model = require('./model'); // se pone ./ porque es un fichero local.
const {log, biglog, errorlog, colorize} = require("./out");



/**
* Muestra la ayuda.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = rl => {
	 log("Commandos:");
	 log('  h|help - Muestra esta ayuda.');
	 log('  list - Listar los quizzes existentes.');
	 log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
	 log("  add - Añadir un nuevo quiz interactivamente.");
	 log("  delete <id> - Borrar el quiz indicado.");
	 log("  edit <id> - Editar el quiz indicado.");
	 log("  test <id> - Probar el quiz indicado.");
	 log("  p|play - Jugar a preguntar aleatoriamente todos los quizes.");
	 log("  credits - Créditos.");
	 log("  q|quit - Salir del programa.");
	 rl.prompt();
};

/**
* Lista todos los quizzes existentes en el modelo.
*
* @param rl Objeto readline usado para implementar el CLI
*/
exports.listCmd = rl => {
	
	model.getAll().forEach((quiz, id) => {

		log(` [${ colorize(id,'magenta')}]: ${quiz.question} `); // Se pone ${...} para sustituir la ejecucion de lo que hay dentro por un String.
	});
	rl.prompt();
};

/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a mostrar.
*/
exports.showCmd = (rl,id) => {
	
	if (typeof id === "undefined") {
		errorlog(` Falta el parámetro id.`);
	} else {
		try{
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		}catch(error){
			errorlog("El id introducido no es válido");
		}
	}
	rl.prompt();
};

/**
* Añade un nuevo quiz al modelo.
* Pregunta interactivamente por la pregunta y por la respuesta.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
	rl.question(colorize(' Introduce una pregunta: ', 'red'), question => {
		
		rl.question(colorize(' Introduce la respuesta: ', 'red'), answer => {
			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};
	
/**
* Borra un quiz del modelo.
* 
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl,id) => {
	if (typeof id === "undefined") {
		errorlog(` Falta el parámetro id.`);
	} else {
		try{
			model.deleteByIndex(id);
			log(` ${colorize('Se ha borrado la pregunta', 'magenta')}: ${colorize(id, 'red')}`);
			
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();

};

/**
* Edita un quiz del modelo.
* 
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.editCmd = (rl,id) => {
	if (typeof id === "undefined") {
		errorlog(` Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize(' Introduce una pregunta: ', 'red'), question => {

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				
				rl.question(colorize(' Introduce la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por : ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		}catch(error){
			errorlog("El id introducido no es válido");
			rl.prompt();
		}
	}

};

/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
* 
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/	
exports.testCmd = (rl,id) => {
	if (typeof id === "undefined") {
		errorlog(` Falta el parámetro id.`);
		rl.prompt();
	} else { 
		try{
			const quiz = model.getByIndex(id);

			rl.question(` ${colorize(quiz.question, 'red')}${colorize('?','red')}`,answer => {
				if(quiz.answer.toLowerCase() === answer.toLowerCase().trim()){
					log(`Su respuesta es: `);
					biglog('CORRECTA', 'green');
					rl.prompt();
				}else{
					log(`Su respuesta es: `);
					biglog('INCORRECTA', 'red');
					rl.prompt();
				}
			});

		}catch(error){
			errorlog("El id introducido no es válido");
			rl.prompt();
		}
	}
};

/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {
	
	let score = 0;
	
	let toBeResolved = [];
	
	model.getAll().forEach((quiz, id) => {
	toBeResolved.push(id);
	});
	
	const playOne = () => {
	if(toBeResolved.length===0){
		log('Ya no quedan más preguntas!','yellow'); 
		log('Fin del examen. Número de aciertos','yellow'); 
		biglog(score,'yellow');
		rl.prompt();
	}else{
		let idArray = Math.floor(toBeResolved.length*Math.random());
		let idQ = toBeResolved[idArray];
		
		toBeResolved.splice(idArray,1);
		
		let quizi = model.getByIndex(idQ);
		rl.question(` ${colorize(quizi.question, 'red')}${colorize('?','red')}`,answer => {
			if(quizi.answer.toLowerCase() === answer.toLowerCase().trim()){
				score++;
				log(`\n correcta - Llevas acertadas ${score} preguntas \n `, 'magenta');
				
				playOne();
			}else{
				log(` ${colorize('incorrecta - Fin del examen. Has acertado:', 'magenta')} `);
				biglog(score,'blue');
				rl.prompt();
			};

		});

	}
}

playOne();

};

/**
* Muestra los nombres de los autores de la práctica.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
	log('Autores de la práctica:');
	log('Jorge Ubeda Romero', 'green');
	log('Maria Belen Delgado Dominguez', 'green');
	rl.prompt();
};

/**
* Terminar el programa.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
	rl.close();
};