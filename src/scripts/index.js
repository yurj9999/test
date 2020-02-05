import '../pages/index.css';
import {mainButton} from '../modules/Elements';
import {Questions} from '../modules/Questions';

const QUESTIONS = new Questions;

mainButton.addEventListener('change', (e) => {
  const FILE = e.target.files[0];
  
  if (FILE.name.includes('.txt')) {
    
    const READER = new FileReader();

    READER.onload = (() => {

      return (e) => {
        
        const OK = e.target;

        const TEXT = OK.result.split('\n');

        const SOURCE = QUESTIONS.make(TEXT);

        console.log(SOURCE);

      }
    })(FILE);
  
    READER.readAsText(FILE);

  } else {
    console.log('ne ok'); // вместо этого окно с ошибкой, окно общая форма с затемнением бэка (для инфо, хелпа)
  }

});