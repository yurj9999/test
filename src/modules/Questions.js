import {INFO_REG, OPEN_REG, SINGLE_REG, CONDITION_REG} from '../modules/Consts';

export class Questions {

    constructor(utilities) {
        this.utilities = utilities;
    }

    // метод проверяет служебный вопрос типа "condition", на корректность его написания в конфигурационном файле и 
    // возвращает объект condition'а
    _checkCondition(condition, array) {

        // получаем оператор (== или !=), чтобы понимать что это за condition
        const operator = condition.split('').find(item => item === '=' || item === '!');

        // получаем id, к которому относится condition
        const id = condition.slice(0, condition.indexOf(operator));

        // получаем значение после знака (== или !=)
        const count = condition.slice(condition.lastIndexOf('=', condition.length) + 1, condition.length);

        // определяем к какому вопросу отностится id condition'а
        const parent = array.find(item => item.id === id);

        // если нашли к какому вопросу относится condition и у этого вопроса тип - single и у вопрос типа single содержит сам вопрос 
        if (!!parent && SINGLE_REG.test(parent.type) && parent.answers.length >= count) {

            // возвращаем объект с оператором, значением, родителем
            return {
                operator: operator,
                count: count,
                parent: parent,
            }
        } else {
            return {
                operator: null
            }
        }
    }

    // метод возвращает вопросы не являющиеся типом condition
    _offCondition(array) {
        return array.filter(item => !CONDITION_REG.test(item.type));
    }

    // метод возвращает вопросы, являющиеся типом condition
    _findCondition(array) {
        return array.filter(item => CONDITION_REG.test(item.type));
    }

    // метод преобразования массива текста в структурированный объект, для последующей его передачи методу отрисовки вопросов
    make(text) {
        const source = [];

        // формируем массив source, содержащий объекты с элементами, из которых состоит вопрос (id, type, question, answers)
        text.forEach((item, index) => {

            // преобразуем строку в массив с элементами из слов строки, для последующей обработки каждого такого слова
            text[index] = item.split(' ').filter(element => {
                return element !== '';
            });

            // мы знаем, что по условию - второе слово в вопросе - это тип вопроса, ниже - проверка на тип вопроса
            const info = INFO_REG.test(text[index][1]);
            const open = OPEN_REG.test(text[index][1]);
            const single = SINGLE_REG.test(text[index][1]);
            const condition = CONDITION_REG.test(text[index][1]);

            // вычленяем сам вопрос из строки
            const question = text[index].slice(2, text[index].length).join(' ');

            if (question.length > 0) {

                // если тип вопроса info/open/condition/single (причем, если single, то используем метод answers для получения
                // вариантов ответов для single)
                if (info || open || condition || (single && this.utilities.answers(text, index).length > 0)) {

                    // формируем массив с объектами вопрсов, состоящим из id - id вопроса, type - тип вопроса, question - сам
                    // вопрос, answers - ответы, если это тип single
                    source.push({
                        id: text[index][0],
                        type: text[index][1],
                        question: question,
                        answers: single ? this.utilities.answers(text, index) : null
                    });
                }
            }
        });

        // находим в объекте вопросов, все вопросы типа condition для последующей обработки их содержимого
        let conditionArray = this._findCondition(source);

        // перебираем все condition для формирования в них свойства subQuestions, которое содержит вопросы,
        // показываемые в случае правильного или неправильного ответа
        conditionArray.forEach(item => {
            let nextPos = source.indexOf(item) + 1;
            item.subQuestions = [];

            // пока нижестоящий элемент будет не равен концу массива и будет существовать и будет начинаться с табуляции
            while(nextPos !== source.length && !!source[nextPos] && source[nextPos].id[0].includes('\t')) {
                item.subQuestions.push(source[nextPos]);

                // удаляем скопированные элементы
                delete source[nextPos];
                nextPos++;
            }

            // если не найдено ни одного подвопроса, то удаляем сам condition из списка вопросов, как неверно оформленный
            if (item.subQuestions.length === 0) delete source[source.indexOf(item)]; 
        });

        // очищаем массив объектов от пустых элементов
        let sourceClear = source.filter(item => item.length !== 0);

        // снова находим все condition вопросы
        conditionArray = this._findCondition(source);

        // перебираем их и определяем к какому single они относятся, а также, корректны ли сами condition'ы
        conditionArray.forEach(item => {

            // если в condition'е неверный оператор, то удаляем его
            if (!item.question.includes('==') && !item.question.includes('!=')) {
                delete source[source.indexOf(item)];
            } else {

                // иначе, проверяем его на корректность, при помощи _checkCondition и получаем объект condition'а
                const checkCondition = this._checkCondition(item.question, sourceClear);

                // если пришел объект с оператором (=)
                if (checkCondition.operator === '=') {

                    // создаем свойство trueCondition, содержащее вопросы, показываемые в случае правильного ответа
                    checkCondition.parent.trueCondition = item;

                    // trueCount - содержит правильный ответ
                    checkCondition.parent.trueCount = checkCondition.count;

                // если пришел оператор (!) - сохранияем в свойстве falseCondition, вопросы, показываемые в случае
                // неверного ответа    
                } else if (checkCondition.operator === '!') checkCondition.parent.falseCondition = item;
            }
        });

        // делаем выборку без condition'ов
        sourceClear = this._offCondition(sourceClear);

        // удаляем повторяющиеся вопросы
        sourceClear.forEach((item, index) => {
            for (let i = index + 1; i !== sourceClear.length; ++i) {

                // если нижестоящий элемент существует и id вышестоящего = id нижестоящего - удаляем нижестоящий элемент
                if (!!sourceClear[i] && item.id === sourceClear[i].id) delete sourceClear[i];
            }
        });

        // делаем выборку без condition'ов
        sourceClear = this._offCondition(sourceClear);
        
        return sourceClear;
    }
}