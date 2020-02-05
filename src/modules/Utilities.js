export class Utilities {

    answers(array, index) {
        const RESULT = [];
        while (array[index + 1].trim() !== '') {
            RESULT.push(array[index + 1]);
            index++;
        }
        return RESULT;
    }
    
}