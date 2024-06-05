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
        if (this.userInformation == null) {
            document.getElementById("room-number").innerHTML = "Nothing";
        } else {
            document.getElementById("room-number").innerHTML = this.userInformation.key;
            this.ably = new Ably.Realtime(ABLY_KEY);
            this.channel = this.ably.channels.get(this.userInformation.key);

            this.publishMessage = this.publishMessage.bind(this);
            this.$submit.addEventListener('click', this.publishMessage);

            this.displayMessages();
        }
    }

    publishMessage() {
        const messageData = {
            timestamp: new Date().toISOString(),
            name: "chat_message",
            data: {
                sender: this.userInformation.name,
                message: this.$message.value,
            },
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
                this.displayMessages();
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
                //const messageData = JSON.parse(data[0].data);
                const messageData = {};
                for (const message of data) {
                    messageData += {
                        timestamp: message.timestamp,
                        name: message.name,
                        data: JSON.parse(message.data)
                    }
                }
                console.log('Message history:', messageData);
                this.$loadingIndicator.classList.remove('visually-hidden');
                this.$chatBox.innerHTML = "";
                if (messageData.length !== 0) {
                    let messageHtml = messageData.reduce(
                        (html, message) => html += this.generateMessageHtml(message),
                    );
                    this.$chatBox.innerHTML = messageHtml;
                } else {
                    this.$chatBox.innerHTML = `<div></div>`;
                }
            })
            .catch((error) => {
                this.$loadingIndicator.classList.add('visually-hidden');
                console.error("Fetch error: ", error);
            });
    }

    generateMessageHtml(message) {
        console.log("Message:", message); // Check the message object
        const messageHtml = `<div>${message.data.sender} - ${message.data.message}</div>`;
        console.log("Message HTML:", messageHtml); // Check the generated HTML
        return messageHtml;
    }
}

window.onload = () => {
    new Blather();
}