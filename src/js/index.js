// Being Worked On By Samuel Kjelde, 6/3/2024
import './general';

class ChatSetUp {
    constructor() {
        this.$userName = document.getElementById("name");
        this.$key = document.getElementById("key");
        this.$submit = document.getElementById("submitIndex");

        this.onSubmit = this.onSubmit.bind(this).$key
        this.$submit.addEventListener('click', this.onSubmit);
    }

    onSubmit() {
        let userInfomation = this.getInputValues();
        let inputResults = this.validateInputResults(userInfomation);

        if(inputResults.isValid){
            this.removeErrors();
            this.chatValidated(userInfomation)
        }
        else {
            this.removeErrors();
            this.hightlightErrors(inputResults.result);
        }
    }

    getInputValues() {
        return {
            name: this.$userName.value,
            key: this.$key.value,
        };
    }

    validateInputResults(userInfomation) {
        const namePattern = /^.{1}/;
        const keyPattern = /^\d{5}$/;

        const result = {
            name: namePattern.test(userInfomation.name),
            key: keyPattern.test(userInfomation.key),
        };

        let field, isValid = true;

        for (field in result) {
            isValid = isValid && result[feild];
        }

        return {
            isValid,
            result,
        };
    }

    resetInputField() {
        this.$userName.value = "";
        this.$key.value = "";
    }

    hightlightErrors(result) {
        if(!result.name){
            this.$userName.classList.add('is-invalid');
        }
        if(!result.key){
            this.$key.classList.add('is-invalid');
        }
    }

    removeErrors(result) {
        if(!result.name){
            this.$userName.classList.remove('is-invalid');
        }
        if(!result.key){
            this.$key.classList.remove('is-invalid');
        }
    }

    chatValidated(userInfomation){
        
    }
}

window.onload = () => {
    new ChatSetUp();
}