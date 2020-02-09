import '../pages/index.css';

import {mainButton} from '../modules/Elements';
import {Questions} from '../modules/Questions';
import {Utilities} from '../modules/Utilities';
import {Dom} from '../modules/Dom';

const utilities = () => new Utilities;
const dom = new Dom(utilities());
const questions = new Questions(utilities());


mainButton.addEventListener('change', (e) => {
  const file = e.target.files[0];
  
  if (file.name.includes('.txt')) {
    
    const reader = new FileReader();

    reader.onload = (() => {

      return (e) => {
        
        const ok = e.target;

        // создаем массив из текста в файле
        const text = ok.result.split('\n');

        // передаем массив методу make, для преобразования его в структурированные данные в виде объектов с вопросами
        const source = questions.make(text);

        // если массив структурированных данных не пустой, передаем его в метод, определяющий, какой тип вопросов отрисовывать
        // - render
        if (source.length > 0) dom.render(source, 0);

      }
    })(file);
  
    reader.readAsText(file);

  } else alert('Выберите файл формата txt');

});