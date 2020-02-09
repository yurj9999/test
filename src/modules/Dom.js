import {preloaderLoading, content, headerWrapper, buttonWrapper} from './Elements';

export class Dom {

    constructor(utilities) {
        this.utilities = utilities;
        this.result = [];
    }

    // метод создания кнопки "Следующий вопрос"
    _nextButton() {
        const buttonInfoNext = document.createElement('button');
        buttonInfoNext.textContent = 'Следующий вопрос';
        return buttonInfoNext;
    }

    // метод создания вопроса типа info, text - текст вопроса, position - позиция вопроса, array - массив с вопросами
    _info(text, position, array) {
        const info = document.createElement('div');
        const infoQuestion = document.createElement('p');
        infoQuestion.textContent = text;
        const nextButton = this._nextButton();

        info.setAttribute('class', 'info');
        infoQuestion.setAttribute('class', 'info__question');
        nextButton.setAttribute('class', 'button-info_next');

        info.appendChild(infoQuestion);
        info.appendChild(nextButton);
        content.appendChild(info);

        const click = nextButton.addEventListener('click', () => {
            nextButton.removeEventListener('click', click);
            content.removeChild(info);

            // рекурсивно вызвываем метод render, передаем ему массив с вопросами и следующую позицию
            this.render(array, ++position);
        });
    }

    // метод создания вопроса типа open, text - текст вопроса, position - позиция вопроса, array - массив с вопросами
    _open(text, position, array) {

        const open = document.createElement('div');
        const openQuestion = document.createElement('p');
        const openTextarea = document.createElement('textarea');

        open.setAttribute('class', 'open');
        openQuestion.setAttribute('class', 'open__question');
        openTextarea.setAttribute('class', 'open__textarea');
        openTextarea.setAttribute('placeholder', 'Ведите ответ');
        openTextarea.setAttribute('type', 'text');

        openQuestion.textContent = text;

        const nextButton = this._nextButton();
        nextButton.disabled = true;
        nextButton.classList.toggle('disabled');

        open.appendChild(openQuestion);
        open.appendChild(openTextarea);
        open.appendChild(nextButton);
        content.appendChild(open);

        // активируем/деативируем кнопку "Следующий вопрос", в зависимости от непустого/пустого поля ввода текста
        const textInput = openTextarea.addEventListener('input', () => {
            if (openTextarea.value.trim() != '') {
                nextButton.disabled = false;
                nextButton.classList.add('button-info_next');
            } else {
                nextButton.disabled = true;
                nextButton.classList.remove('button-info_next');
            }
        });

        const click = nextButton.addEventListener('click', () => {
            nextButton.removeEventListener('click', click);
            openTextarea.removeEventListener('input', textInput);

            // записываем в массив ответов, ответ введенный в textarea
            this.result.push({
                question: text,
                answer: openTextarea.value
            });

            content.removeChild(open);

            // рекурсивно вызвываем метод render, передаем ему массив с вопросами и следующую позицию
            this.render(array, ++position); 
        });   
    }

    // метод создания вопроса типа single, text - текст вопроса, position - позиция вопроса, array - массив с вопросами
    _single(text, position, array) {

        const single = document.createElement('div');
        const singleQuestion = document.createElement('p');
        const singleForm = document.createElement('form');

        const nextButton = this._nextButton();
        nextButton.disabled = true;
        nextButton.classList.toggle('disabled');

        single.setAttribute('class', 'single');
        singleQuestion.setAttribute('class', 'single__question');
        singleForm.setAttribute('class', 'single__form');
        singleQuestion.textContent = text;

        single.appendChild(singleQuestion);
        single.appendChild(singleForm);
        single.appendChild(nextButton);

        const answers = array[position].answers;
        const trueCount = array[position].trueCount;

        // проходим по массиву с ответами и формируем radio button'ы
        answers.forEach((item, index) => {
            const radio = document.createElement('div');
            const input = document.createElement('input');
            const label = document.createElement('label');

            radio.setAttribute('class', 'radio');

            input.setAttribute('type', 'radio');
            input.setAttribute('id', `radio${index}`);
            input.setAttribute('name', 'single-choise');
            input.setAttribute('value', `${index}`);
            input.setAttribute('class', 'round');

            label.setAttribute('for', `radio${index}`);
            label.setAttribute('class', 'label-radio');

            label.textContent = item;

            radio.appendChild(input);
            radio.appendChild(label);
            singleForm.appendChild(radio);
        });

        content.appendChild(single);

        let choose;
        let chooseText;

        // в переменную choose записываем value ответа, для последующего сравнения с правильным ответом, 
        // в переменную chooseText записываем сам текст ответа, для передачи его в массив результатов
        const radioChoise = singleForm.addEventListener('click', (e) => {
            if ((e.target.classList.contains('label-radio') || e.target.classList.contains('round')) && e.target.name === 'single-choise') {
                choose = e.target.value;
                chooseText = e.target.nextElementSibling.textContent.trim();

                nextButton.disabled = false;
                nextButton.classList.add('button-info_next');
            }
        });

        const click = nextButton.addEventListener('click', (e) => {
            nextButton.removeEventListener('click', click);
            singleForm.removeEventListener('click', radioChoise);

            // записываем в массив ответов
            this.result.push({
                question: text,
                answer: chooseText
            });

            // проверяем наличие заданного заранее правильного ответа, если да, то - проверяем его совпадение с введенным ответом
            // в зависимости от ответа, будут выведены те или иные вопросы
            if (!!trueCount) {

                // если ответили верно
                if (parseInt(trueCount) === parseInt(choose)) {
                
                    content.removeChild(single);

                    // так как, для вывода вопросов, в зависимости от ответа рекурсивно используется метод render
                    // и ему будут переданы массив новых подвопросов и стартовая позиция новых подвопросов, то возможен такой вариант,
                    // когда, после вывода подвопросов, нужно будет вернуться обратно в основной массив,
                    // чтобы выводить далее основные вопросы, если они там остались, для этого нужно сохранить текущую позицию 
                    // вопроса и текущий массив, для этого в подвопросах, в свойствах backPosition и backupArray записываем
                    // текущую позицию и текущий массив
                    array[position].trueCondition.subQuestions.backPositon = position;
                    array[position].trueCondition.subQuestions.backupArray = [];
                    array.forEach(item => array[position].trueCondition.subQuestions.backupArray.push(item));

                    // вызываем метод render, передаем ему подвопросы и стартовую позицию
                    this.render(array[position].trueCondition.subQuestions, 0);

                // если ответили неверно
                } else {
                    content.removeChild(single);

                    // также, сохранияем позицию и основной массив в backPosition и backupArray
                    array[position].falseCondition.subQuestions.backPositon = position;
                    array[position].falseCondition.subQuestions.backupArray = [];
                    array.forEach(item => array[position].falseCondition.subQuestions.backupArray.push(item));
                    
                    // вызываем метод render, передаем ему подвопросы и стартовую позицию
                    this.render(array[position].falseCondition.subQuestions, 0); 
                } 
            
            // если подвопросов нет
            } else {
                content.removeChild(single);

                // вызываем метод render, передаем ему основной массив с вопросами и стартовую позицию
                this.render(array, ++position);
            }
        });
    }
    
    // метод, определяющий тип вопросов для отрисовки, source - мессив с вопросами, position - стартовая позиция
    render(source, position) {

        preloaderLoading.setAttribute('style', 'display: none;');
        headerWrapper.setAttribute('style', 'height: 100px;');
        buttonWrapper.setAttribute('style', 'display: none;');

        // если текущая позиция (position) более длинны массива (это означает, что массив с подвопросами перебран) 
        if (position >= source.length) {

            // если свойство backPosition существует в массиве с подвопросом и сохраненная позиция вопроса + 1 не равна длинне 
            // основного массива с вопросами, то надо вернуться назад в основной массив, для вывода оставшихся
            // вопросов, об этом свидетельствует наличие свойств backPosition и сохраненного соновного массива в 
            // свойстве backupArray
            if (!!source.backPositon && source.backPositon + 1 !== source.backupArray.length) {

                // сохраняем в position, сохраненную ранее позицию + 1 (+1 - переходим на следующий вопрос в основном массиве)
                position = source.backPositon + 1;
                const questionSource = source.backupArray[position];

                // проверяем какой тип вопроса и вызываем соответствующий метод отрисовки этого типа вопроса
                if (questionSource.type.toLowerCase() === 'info') {
                    this._info(questionSource.question, position, source.backupArray);
                } else if (questionSource.type.toLowerCase() === 'open') {
                    this._open(questionSource.question, position, source.backupArray);
                } else if (questionSource.type.toLowerCase() === 'single') {
                    this._single(questionSource.question, position, source.backupArray);
                }

            // если все элементы массива перебраны
            } else {

                // сохраняем результаты в память компьютера, в localStorage
                this.utilities.saveLocalStorage(this.result);

                alert('Ответы на все вопросы сохранены');

                preloaderLoading.removeAttribute('style', 'display: none;');
                headerWrapper.removeAttribute('style', 'height: 100px;');
                buttonWrapper.removeAttribute('style', 'display: none;');
            }

        // если текущая позиция менее длинны массива, определяем какой тип вопроса отрисовать
        } else if (source[position].type.toLowerCase() === 'info') {
            this._info(source[position].question, position, source);
        } else if (source[position].type.toLowerCase() === 'open') {
            this._open(source[position].question, position, source);
        } else if (source[position].type.toLowerCase() === 'single') {
            this._single(source[position].question, position, source);
        }
    }
}