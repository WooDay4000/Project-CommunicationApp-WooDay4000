// Completed By Samuel Kjelde, 6/6/2024
import './general';

class ChatSetUp {
    constructor() {
        this.$userName = document.getElementById("name");
        this.$key = document.getElementById("key");
        this.$submit = document.getElementById("submitIndex");

        // Gets from local Storage the fetchError that was from the
        // fetch the displayMessages method
        this.error = JSON.parse(localStorage.getItem("fetchError"));;
        // Gets from local Storage the userInformation the user imputed into the
        // form from the index.html file.
        this.userInformation = JSON.parse(localStorage.getItem("userInformation"));

        // Where if the error isn't null, which means that there was a error.
        if (this.error != null) {
            // It will cause an alert, tell the user there was an error,
            // and what exactly this error was using this.error. 
            alert("Error! Please Try Again! Error Message: " + this.error);
            // Then setting the fetchError error to "", so that on reload
            // or revisiting the index.html, this error won't be
            // displaying on repeat.
            localStorage.setItem("fetchError", JSON.stringify(""));
        }
        // Where if there wasn't an error and the input 
        // name and key inputs are both empty, and there
        // is information currently stored to userInformation,
        // then it will sent the name and key inputs to the
        // corresponding name and key felid values stored
        // in userInformation
        else if ((!this.$userName.value && !this.$key.value) && this.userInformation) {
            this.$userName.value = this.userInformation.name;
            this.$key.value = this.userInformation.key;
        }

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.$submit.addEventListener('click', this.onFormSubmit);
    }

    // A method that is used to validate the name and key inputs
    // from the form on the index html webpage.
    onFormSubmit(event) {
        event.preventDefault();
        // Where using the getInputValues, it turns the values
        // from the name and key inputs into a object.
        let userInformation = this.getInputValues();
        // Which is ran though the validateInputResults method,
        // to make object consisting of a isValid felid that is
        // set to true if all the felids from the userInformation
        // object are valid, and set to false if any of the felids
        // are not valid. And a felid that is an oject
        // consisting of the results of each felid from userInformation
        // to see if there valid or not, which is true or false.
        let inputResults = this.validateInputResults(userInformation);

        // Where if the isValid felid from the inputResults object is true,
        // then it wil run the removeErrors and connectionValidated
        // method.
        if (inputResults.isValid) {
            this.removeErrors(inputResults.result);
            this.connectionValidated(userInformation)
        }
        // else it will run the removeErrors and highlightErrors
        // methods.
        else {
            this.removeErrors(inputResults.result);
            this.highlightErrors(inputResults.result);
        }
    }

    // A method used to return a object that is
    // made up of values from the name and key inputs.
    getInputValues() {
        return {
            name: this.$userName.value,
            key: this.$key.value,
        };
    }

    // A method used to validate the name and key input values.
    // Return a object that has object consisting of a name and key felid, that shows true
    // if valid and false if not valid, and a felid called isValid that shows true when both
    // key and name felids are true, and false if any one of the key and name felids are false.
    validateInputResults(userInformation) {
        // A regular expression used to check if the name imputed
        // by the user, has at least one digit or letter
        // and does not began with a space.
        const namePattern = /^(?!\s)(?=.*[a-zA-Z]|.*\d).{1,}$/
        // A regular expression used to check if the key imputed
        // by the user, is exactly five digits.
        const keyPattern = /^\d{5}$/;

        // The object used to hold the results of the regular expression
        // on there respective input.
        const result = {
            name: namePattern.test(userInformation.name),
            key: keyPattern.test(userInformation.key),
        };

        let felid, isValid = true;

        // Goes though the result object felids and sets isValid
        // to false from true, if any of the felids are negative.
        for (felid in result) {
            isValid = isValid && result[felid];
        }

        // Return an object that has the isValid felid with it's current value,
        // and a felid holding the result object with it's current felids.
        return {
            isValid,
            result,
        };
    }

    // Clears the values from the name and key input elements
    resetInputField() {
        this.$userName.value = "";
        this.$key.value = "";
    }

    // Adds the 'is-invalid' class to the name and key input
    // elements that have errors.
    highlightErrors(result) {
        if (!result.name) {
            this.$userName.classList.add('is-invalid');
        }
        if (!result.key) {
            this.$key.classList.add('is-invalid');
        }
    }

    // Removes the 'is-invalid' class from the name and key input
    // elements that had errors.
    removeErrors(result) {
        if (!result.name) {
            this.$userName.classList.remove('is-invalid');
        }
        if (!result.key) {
            this.$key.classList.remove('is-invalid');
        }
    }

    // Where this method is used when the values name and key input
    // are valid. With it's propose is to save the userInformation object
    // consisting name and key felid to local storage, where then it sends
    // the user to the blather.html webpage, where they can begin chatting.
    connectionValidated(userInformation) {
        localStorage.setItem("userInformation", JSON.stringify(userInformation));
        window.location.href = "blather.html";
    }
}

window.onload = () => {
    new ChatSetUp();
}