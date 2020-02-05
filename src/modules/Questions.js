import {INFO_REG, OPEN_REG, SINGLE_REG, CONDITION_REG} from '../modules/Consts';
import {Utilities} from '../modules/Utilities';

const UTILITIES = new Utilities;

export class Questions {

    _checkCondition(condition, array) {

        const operator = condition.split('').find(item => item === '=' || item === '!');
        const id = condition.slice(0, condition.indexOf(operator));
        const count = condition.slice(condition.lastIndexOf('=', condition.length) + 1, condition.length);

        const parent = array.find(item => item.id === id);

        if (!!parent && SINGLE_REG.test(parent.type) && parent.answers.length >= count) {
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
    
    make(text) {

        const SOURCE = [];

        text.forEach((item, index) => {
            
            text[index] = item.split(' ').filter(element => {
                return element !== '';
            });

            const INFO = INFO_REG.test(text[index][1]);
            const OPEN = OPEN_REG.test(text[index][1]);
            const SINGLE = SINGLE_REG.test(text[index][1]);
            const CONDITION = CONDITION_REG.test(text[index][1]);

            const QUESTION = text[index].slice(2, text[index].length).join(' ');

            if (QUESTION.length > 0) {
                
                if (INFO || OPEN || CONDITION || (SINGLE && UTILITIES.answers(text, index).length > 0)) {
              
                    SOURCE.push({
                        id: text[index][0],
                        type: text[index][1],
                        question: QUESTION,
                        answers: SINGLE ? UTILITIES.answers(text, index) : null
                    });

                }

            }

        });
        
        let CONDITION_ARRAY = SOURCE.filter(item => CONDITION_REG.test(item.type));

        CONDITION_ARRAY.forEach(item => {

            let nextPos = SOURCE.indexOf(item) + 1;
            item.subQuestions = [];

            while(nextPos !== SOURCE.length && 'id' in SOURCE[nextPos] && SOURCE[nextPos].id[0].includes('\t')) {
                item.subQuestions.push(SOURCE[nextPos]);
                delete SOURCE[nextPos];
                nextPos++;
            }

            if (item.subQuestions.length === 0) delete SOURCE[SOURCE.indexOf(item)]; 

        });

        let sourceClear = SOURCE.filter(item => item.length !== 0);

        CONDITION_ARRAY = SOURCE.filter(item => CONDITION_REG.test(item.type));

        CONDITION_ARRAY.forEach(item => {

            if (!item.question.includes('==') && !item.question.includes('!=')) {
                delete SOURCE[SOURCE.indexOf(item)];
            } else {
                
                const CHECK_CONDITION = this._checkCondition(item.question, sourceClear);

                if (CHECK_CONDITION.operator === '=') {
                    CHECK_CONDITION.parent.trueCondition = item;
                    CHECK_CONDITION.parent.trueCount = CHECK_CONDITION.count;
                } else if (CHECK_CONDITION.operator === '!') CHECK_CONDITION.parent.falseCondition = item;
                
            }

        });

        return sourceClear = sourceClear.filter(item => !CONDITION_REG.test(item.type));

    }
}