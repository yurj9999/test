import {preloaderLoading, content, headerWrapper, buttonWrapper} from './Elements';

export class Dom {

    constructor(utilities) {
        this.utilities = utilities;
        this.result = [];
    }

    _nextButton() {
        const buttonInfoNext = document.createElement('button');
        buttonInfoNext.textContent = 'Следующий вопрос';
        return buttonInfoNext;
    }

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
            this.render(array, ++position);
        });
    }

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

            this.result.push({
                question: text,
                answer: openTextarea.value
            });

            content.removeChild(open);
            this.render(array, ++position); 
        });   
    }

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

            this.result.push({
                question: text,
                answer: chooseText
            });

            if (!!trueCount) {
                if (parseInt(trueCount) === parseInt(choose)) {
                
                    content.removeChild(single);

                    array[position].trueCondition.subQuestions.backPositon = position;
                    array[position].trueCondition.subQuestions.backupArray = [];
                    array.forEach(item => array[position].trueCondition.subQuestions.backupArray.push(item));

                    this.render(array[position].trueCondition.subQuestions, 0);
                } else {
                    content.removeChild(single);

                    array[position].falseCondition.subQuestions.backPositon = position;
                    array[position].falseCondition.subQuestions.backupArray = [];
                    array.forEach(item => array[position].falseCondition.subQuestions.backupArray.push(item));
                    
                    this.render(array[position].falseCondition.subQuestions, 0); 
                } 
            } else {
                content.removeChild(single);

                this.render(array, ++position);
            }
        });
    }
    
    render(source, position) {

        preloaderLoading.setAttribute('style', 'display: none;');
        headerWrapper.setAttribute('style', 'height: 100px;');
        buttonWrapper.setAttribute('style', 'display: none;');

        if (position >= source.length) {

            if (!!source.backPositon && source.backPositon + 1 !== source.backupArray.length) {

                position = source.backPositon + 1;
                const questionSource = source.backupArray[position];

                if (questionSource.type.toLowerCase() === 'info') {
                    this._info(questionSource.question, position, source.backupArray);
                } else if (questionSource.type.toLowerCase() === 'open') {
                    this._open(questionSource.question, position, source.backupArray);
                } else if (questionSource.type.toLowerCase() === 'single') {
                    this._single(questionSource.question, position, source.backupArray);
                }

            } else {

                this.utilities.saveLocalStorage(this.result);

                alert('Ответы на все вопросы сохранены');

                preloaderLoading.removeAttribute('style', 'display: none;');
                headerWrapper.removeAttribute('style', 'height: 100px;');
                buttonWrapper.removeAttribute('style', 'display: none;');
                
            }

        } else if (source[position].type.toLowerCase() === 'info') {
            this._info(source[position].question, position, source);
        } else if (source[position].type.toLowerCase() === 'open') {
            this._open(source[position].question, position, source);
        } else if (source[position].type.toLowerCase() === 'single') {
            this._single(source[position].question, position, source);
        }
    }
}