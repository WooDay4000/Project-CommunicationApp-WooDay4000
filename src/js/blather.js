// Being Worked On By Samuel Kjelde, 6/3/2024
import './general';
import Ably from 'ably';

class Blather {
    constructor() {
        this.$chatBox = document.getElementById("chatBox");
        this.$message = document.getElementById("messageInput");
        this.$submit = document.getElementById("submitMessage");
        this.$returnButton = document.getElementById("return-button");
        this.$roomNumber = document.getElementById("roomNumber");
        this.userInformation = JSON.parse(localStorage.getItem("userInformation"));

        this.$returnButton.addEventListener("click", (event) => {
            window.location.href = "index.html"
        })

        if (this.userInformation == null) {
            this.$roomNumber.innerHTML = "Nothing";
        } else {
            this.$roomNumber.innerHTML = this.userInformation.key;
            this.ably = new Ably.Realtime(ABLY_KEY);
            this.channel = this.ably.channels.get(`chatting:${this.userInformation.key}`);

            this.channel.subscribe(() => {
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
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const messageData = {
            timestamp: currentDate.toISOString(),
            name: "chat_message",
            data: {
                sender: this.userInformation.name,
                message: this.$message.value,
                date: `${month}/${day}/${year}`,
                time: currentDate.toLocaleTimeString(),
            },
        };

        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(ABLY_KEY),
            'Content-Type': 'application/json'
        });

        fetch(`https://rest.ably.io/channels/chatting:${this.userInformation.key}/messages`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(messageData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Message published successfully:', data);
                this.$message.value = "";
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

        fetch(`https://rest.ably.io/channels/chatting:${this.userInformation.key}/messages`, {
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
                this.$chatBox.innerHTML = "";
                if (messageData.length !== 0) {
                    messageData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    console.log('Message history:', messageData);
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
                localStorage["fetchError"] = json.stringify(error);
                window.location.href = "index.html";
            });
    }

    generateMessageHtml(message) {
        return `
            <div class="message ${message.data.sender == this.userInformation.name ? 'currentUser' : 'otherUsers'}">
                <div class="sender">
                    <h7><span class="senderName">${message.data.sender}</span> - ${message.data.date}, ${message.data.time}</h7>
                </div>    
                <div class="userMessage">
                    <p>${message.data.message}</p>
                </div>
            </div>
        `
    }
}

window.onload = () => {
    new Blather();
}