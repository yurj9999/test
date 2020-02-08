export class Utilities {

    // метод получения вариантов ответов для вопроса типа single.
    // формирует массив ответов, пока не встретит пустую строку - знак окончания вариантов ответа для single
    answers(array, index) {
        const result = [];
        while (array[index + 1].trim() !== '') {
            result.push(array[index + 1]);
            index++;
        }
        return result;
    }

    // метод сохранения вопросов и ответов на них, в local storage
    saveLocalStorage(source) {
        localStorage.clear();
        localStorage.setItem('dataAnswers', JSON.stringify(source));
    }

}