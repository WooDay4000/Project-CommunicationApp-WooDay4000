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

            this.channel.subscribe((message) => {
                //console.log("New message received: " + message.data);
                this.displayMessages();
            });

            this.publishMessage = this.publishMessage.bind(this);
            this.$submit.addEventListener('click', this.publishMessage);

            document.getElementById('messageInput').addEventListener('keydown', (event) => {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    this.publishMessage();
                }
            });
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
                this.$message.value = "";
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
                let messageData = [];
                for (const message of data) {
                    messageData.push({
                        timestamp: message.timestamp,
                        name: message.name,
                        data: JSON.parse(message.data)
                    });
                }
                console.log('Message history:', messageData);
                this.$loadingIndicator.classList.remove('visually-hidden');
                this.$chatBox.innerHTML = "";
                if (messageData.length !== 0) {
                    messageData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    let messageHtml = messageData.reduce((html, message) => {
                        return html + this.generateMessageHtml(message);
                    }, '');
                    this.$chatBox.innerHTML = messageHtml;
                } else {
                    this.$chatBox.innerHTML = `<div></div>`;
                }
                let scrollableElement = document.querySelector('.scrollable');
                scrollableElement.scrollTop = scrollableElement.scrollHeight;
            })
            .catch((error) => {
                this.$loadingIndicator.classList.add('visually-hidden');
                console.error("Fetch error: ", error);
            });
    }


    generateMessageHtml(message) {
        return `
            <div class="message ${message.data.sender == this.userInformation.name ? 'current-user' : 'other-user'}">
                <div class="sender">
                    <h7>${message.data.sender}</h7>
                </div>    
                <div class="user-message">
                    <p>${message.data.message}</p>
                </div>
            </div>
        `

        /* console.log("Message:", message); // Check the message object
        const messageHtml = `<div>${message.data.sender} - ${message.data.message}</div>`;
        console.log("Message HTML:", messageHtml); // Check the generated HTML
        return messageHtml; */
    }
}

window.onload = () => {
    new Blather();
}