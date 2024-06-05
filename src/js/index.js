// Being Worked On By Samuel Kjelde, 6/3/2024
import './general';

class ChatSetUp {
    constructor() {
        this.$userName = document.getElementById("name");
        this.$key = document.getElementById("key");
        this.$submit = document.getElementById("submitIndex");
        this.error = JSON.parse(localStorage.getItem("fetchError"));;

        if(this.error != null) {
            alert("Error! Please Try Again! Error Message: " + this.error);
        }
        

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.$submit.addEventListener('click', this.onFormSubmit);
    }

    onFormSubmit(event) {
        event.preventDefault();
        let userInformation = this.getInputValues();
        let inputResults = this.validateInputResults(userInformation);

        if (inputResults.isValid) {
            this.removeErrors(inputResults.result);
            this.connectionValidated(userInformation)
        }
        else {
            this.removeErrors(inputResults.result);
            this.highlightErrors(inputResults.result);
        }
    }

    getInputValues() {
        return {
            name: this.$userName.value,
            key: this.$key.value,
        };
    }

    validateInputResults(userInformation) {
        const namePattern = /^.{1}/;
        const keyPattern = /^\d{5}$/;

        const result = {
            name: namePattern.test(userInformation.name),
            key: keyPattern.test(userInformation.key),
        };

        let felid, isValid = true;

        for (felid in result) {
            isValid = isValid && result[felid];
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

    highlightErrors(result) {
        if (!result.name) {
            this.$userName.classList.add('is-invalid');
        }
        if (!result.key) {
            this.$key.classList.add('is-invalid');
        }
    }

    removeErrors(result) {
        if (!result.name) {
            this.$userName.classList.remove('is-invalid');
        }
        if (!result.key) {
            this.$key.classList.remove('is-invalid');
        }
    }

    connectionValidated(userInformation) {
        localStorage["userInformation"] = JSON.stringify(userInformation);
        window.location.href = "blather.html";
    }
}

window.onload = () => {
    new ChatSetUp();
}