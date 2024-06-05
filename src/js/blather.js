// Being Worked On By Samuel Kjelde, 6/3/2024
import './general';
// Adding what is needed for Ably
import Ably from 'ably';


class Blather {
    constructor() {
        this.$chatBox = document.getElementById("chat-box");
        this.$message = document.getElementById("messageInput");
        this.$submit = document.getElementById("submitMessage");
        this.$loadingIndicator = document.querySelector('#loadingIndicator');

        this.userInformation = JSON.parse(localStorage["userInformation"]);
        this.ably = new Ably.Realtime(ABLY_KEY);
    }


}