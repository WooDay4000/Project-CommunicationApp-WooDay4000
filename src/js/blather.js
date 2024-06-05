// Being Worked On By Samuel Kjelde, 6/3/2024
import './general';
import Ably from 'ably';

class Blather {
    constructor() {
        this.$chatBox = document.getElementById("chat-box");
        this.$message = document.getElementById("messageInput");
        this.$submit = document.getElementById("submitMessage");
        this.$loadingIndicator = document.querySelector('#loadingIndicator');

        this.userInformation = JSON.parse(localStorage.getItem("userInformation"));
        document.getElementById("room-number").innerHTML = this.userInformation.key;
        this.ably = new Ably.Realtime(ABLY_KEY);
        this.channel = this.ably.channels.get(this.userInformation.key);

        this.publishMessage = this.publishMessage.bind(this);
        this.$submit.addEventListener('click', this.publishMessage);

        this.displayMessages();
    }

    publishMessage() {
        const messageData = {
            timestamp: new Date().toISOString(),
            data: {
                userName: this.userInformation.name,
                message: this.$message.value,
            },
            name: "chat_message",
        };

        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(ABLY_KEY),
            'Content-Type': 'application/json'
        });

        fetch(`https://rest.ably.io/channels/${this.userInformation.key}/messages`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(messageData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Message published successfully:', data);
                this.displayMessages(); // Update UI after publishing message
            })
            .catch(error => {
                console.error('Error publishing message:', error);
            });
    }

    displayMessages() {
        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(ABLY_KEY),
            'Content-Type': 'application/json'
        });

        fetch(`https://rest.ably.io/channels/${this.userInformation.key}/messages`, {
            method: 'GET',
            headers: headers,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Message history:', data);
                this.$loadingIndicator.classList.remove('visually-hidden');
                this.$chatBox.innerHTML = ""; // Clear chat box before updating
                if (data.length !== 0) {
                    let messageHtml = data.reduce(
                        (html, message, index) => html += this.generateMessageHtml(message),
                        ''
                    );
                    this.$chatBox.innerHTML = messageHtml; // Update chat box with new messages
                } else {
                    this.$chatBox.innerHTML = `<div></div>`;
                }
            })
            .catch((error) => {
                this.$loadingIndicator.classList.add('visually-hidden');
                console.error("Fetch error: ", error);
                // Consider displaying an error message to the user
            });
    }

    generateMessageHtml(message) {
        console.log("Message:", message); // Check the message object
        const messageHtml = `<div>${message.userName} - ${message.message}</div>`;
        console.log("Message HTML:", messageHtml); // Check the generated HTML
        return messageHtml;
    }
}

window.onload = () => {
    new Blather();
}