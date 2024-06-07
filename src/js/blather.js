// Completed By Samuel Kjelde, 6/6/2024
import { Alert } from 'bootstrap';
import './general';
import Ably from 'ably';

class Blather {
    constructor() {
        this.$chatBox = document.getElementById("chatBox");
        this.$message = document.getElementById("messageInput");
        this.$submit = document.getElementById("submitMessage");
        this.$goBackButton = document.getElementById("goBackButton");
        this.$roomNumber = document.getElementById("roomNumber");

        // Gets from local Storage the userInformation the user imputed into the
        // form from the index.html file.
        this.userInformation = JSON.parse(localStorage.getItem("userInformation"));

        // Adds an event that when the go back button is clicked, it'l
        // send the user back to the index.html file, so they can input
        // a different key or if they want to change there name,
        this.$goBackButton.addEventListener("click", (event) => {
            window.location.href = "index.html"
        })

        // This if else statement is used in the case the the goes back the chat room
        // after they deleted there local storage or gone back after clearing there
        // search history.
        if (this.userInformation == null) {
            // Where in this state the application won't run, and the only thing that changes
            // is the room name, with it now being "Nothing"
            this.$roomNumber.innerHTML = "Nothing";
        } else {
            this.$roomNumber.innerHTML = this.userInformation.key;
            //---------------------------------------------

            // Some of the ably stuff to get this application working.
            // this.ably with this code is now a Ably Realtime library,
            // where it allows in JavaScript to interact with the
            // Ably Realtime service
            this.ably = new Ably.Realtime(ABLY_KEY);
            // This is used to create an interactive instance of a 
            // ably channel, where the messages will be stored and
            // gotten from. With this also creates a channel in the process
            // with the perimeter in the get method part of this, being the
            // namespace this channel falls under which allows for it to hold on 
            // to it's messages for 24 hours instead of 2 minutes,
            // and the this.userInformation.key part is what the channel 
            // is going be named to.
            this.channel = this.ably.channels.get(`chatting:${this.userInformation.key}`);
            // Where with this is interactive instance of a 
            // ably channel, we can use in subscribe, a ably method 
            // which picks up if there was any changes made to the channel 
            // it's linked to, such as a messages being sent to it. 
            // Where if a change is made, it can return the message that was
            // sent to the channel, but it can also be used to run a piece of
            // code.
            this.channel.subscribe(() => {
                // With this case, being running the displayMessages method,
                // which displays all the messages to the chat
                // box in the blather html, for all the current users
                // to see.
                this.displayMessages();
            });

            //---------------------------------------------
            this.publishMessage = this.publishMessage.bind(this);
            this.$submit.addEventListener('click', this.publishMessage);
            // Added this so that when the user has the test input
            // selected to write a message, there able to hit enter
            // on there keyboard to run the publishMessage, so that
            // there message could be sent without having to take
            // there hands off the keyboard.
            document.getElementById('messageInput').addEventListener('keydown', (event) => {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    this.publishMessage();
                }
            });
            // Runs the displayMessages method on start up to displays all 
            // the messages in the current chanel to the chat box 
            // in the blather html, for all the current users see.
            this.displayMessages();
        }
    }

    // The method used to send the user's created message to the
    // current channel.
    publishMessage() {
        // A regular expression used to check if the imputed
        // message in the text messageInput by the user, has at
        // least one digit or letter in the imputed message
        const messagePattern = /^(?=.*[a-zA-Z]|.*\d).{1,}$/;
        // Where with this if statement if the imputed
        // messages passes, then the publishMessage can run.
        // Where if it fails then the publishMessage method
        // can't run.
        if (messagePattern.test(this.$message.value)) {
            // This creates a Date object that represents
            // the current date and time,
            const currentDate = new Date();
            // Where the following variables grab from
            // this oject the current day.
            const day = currentDate.getDate();
            // the current month, which this has a
            // plus one, because for the mouths in the
            // there zero indexed, so January is zero,
            // so where need to add a one to have it be
            // in the right place.
            const month = currentDate.getMonth() + 1;
            // And the current year.
            const year = currentDate.getFullYear();

            // This messageData, is the message that is going
            // to be sent to the ably realtime to be stored.
            // Consisting of a felid for a time stamp of when 
            // this message was sent(this being used later for a sort),
            // a name felid that describes what this object is, and
            // a data felid that houses a object that makes up this message,
            // consisting of the name of the sender, the message itself, the
            // date this message was set, and the time it was sent.
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

            // Makes a headers object that is apart of the fetch
            // call, consisting of a Authorization felid which has my
            // level of subscription for ably and my ably api key, 
            // with this felid allowing for the fetch to be able to
            // actually make the call to ably. Also Content-Type
            // felid which tells that content of this request
            // will be in JSON format.
            const headers = new Headers({
                'Authorization': 'Basic ' + btoa(ABLY_KEY),
                'Content-Type': 'application/json'
            });

            // A fetch method that is making a post request to the ably api,
            // that has a perimeter of the link this request is being made to.
            // With this.userInformation.key being the name of the chanel
            // this fetch is requesting to.
            // With the init object having a felid called body, that is the
            // the messageData oject we made turned into a json string, that is
            // going to be sent.
            // And the headers that takes the headers
            // object we made so that this fetch actually works.
            fetch(`https://rest.ably.io/channels/chatting:${this.userInformation.key}/messages`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(messageData)
            })
                .then(response => response.json())
                .then(data => {
                    // This logs a data object from the request, that shows
                    // the chanel this was sent to and an id of this message,
                    // this is used just to see that the message was made successfully.
                    console.log('Message published successfully:', data);
                    // Then clearing the value from text messageInput,
                    // where the message was written.
                    this.$message.value = "";
                })
                .catch(error => {
                    alert('Error publishing message:', error);
                });
        }
    }

    // The method used to display all the messaged currently stored in the
    // ably channel via a html string created in this method set to the
    // chatBox element.
    displayMessages() {
        // Makes a headers object that is apart of the fetch
        // call, consisting of a Authorization felid which has my
        // level of subscription for ably and my ably api key, 
        // with this felid allowing for the fetch to be able to
        // actually make the call to ably. Also Content-Type
        // felid which tells that content of this request
        // will be in JSON format.
        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(ABLY_KEY),
            'Content-Type': 'application/json'
        });

        // A fetch method that is making a get request to the ably api,
        // that has a perimeter of the link this request is being made to.
        // With this.userInformation.key being the name of the chanel
        // this fetch is requesting to.
        // With the init object having a felid called headers that takes the headers
        // object we made so that this fetch actually works.
        fetch(`https://rest.ably.io/channels/chatting:${this.userInformation.key}/messages`, {
            method: 'GET',
            headers: headers,
        })
            .then(response => response.json())
            .then(data => {
                // Makes a messageData array that is going to store
                let messageData = [];
                // every message that is currently stored in ably.
                for (const message of data) {
                    // With this for of loop that pushing a object
                    // to the messageData array, where this object
                    // is the object that we did send to ably before
                    // but now with the data felid actually being
                    // turned into a json oject that is usable.
                    messageData.push({
                        timestamp: message.timestamp,
                        name: message.name,
                        data: JSON.parse(message.data)
                    });
                }
                // Clears the current html stored to the innerHTML
                // of the chatBox element.
                this.$chatBox.innerHTML = "";
                // This check is done, where if the chat room first
                // runs it will produce an area because there isn't
                // any message to mess with, so instead it goes to
                // the else, where it sets the innerHTML
                // of the chatBox element to empty dive element.
                if (messageData.length !== 0) {
                    // This is used to sort the messageData array in the order
                    // of oldest to newest, using the timestamp felid of each
                    // each object in the array for this sort.
                    messageData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    // Then it logs the results of the sort to console,
                    // so that we can tell the sort was timestamp.
                    console.log('Message history:', messageData);
                    // Runs the array though a reduce method, so that we can
                    // get a messageHtml that is going to be set to the innerHTML
                    // of the chatBox element.
                    let messageHtml = messageData.reduce((html, message) => {
                        // Where each objet is run though the generateMessageHtml
                        // so that it can be turned into a message html, and then 
                        // concatenated to the messageHtml variable.
                        return html + this.generateMessageHtml(message);
                    }, '');
                    // With this created it's set to the innerHTML
                    // of the chatBox element.
                    this.$chatBox.innerHTML = messageHtml;
                } else {
                    this.$chatBox.innerHTML = `<div></div>`;
                }
                // This is being declared here, because if it was
                // declared in the constructor, then it would produce
                // an error, because there an't enough messages in the
                // chat box to make it into a scrollable area yet, it's here
                // to remedy that.
                let scrollableElement = document.querySelector('.scrollable');
                // This variable being used to the set where the user is
                // currently to the bottom of the scrollable area, to see
                // the new message that was displayed.
                scrollableElement.scrollTop = scrollableElement.scrollHeight;
            })
            .catch((error) => {
                // This logs the error result to local storage
                localStorage.setItem("fetchError", JSON.stringify(error));
                // Where it will be used in an alert, that happens after
                // the user is sent back to the starting page because there
                // was an error in displaying the messages or creating
                // the channel.
                window.location.href = "index.html";
            });
    }

    // The method used to make the image html that is set 
    // to the innerHTML of the chatBox element. Where apart
    // of the creation of the html, depending who sent the
    // current message a class will be added to the dive element 
    // that encompasses message information. With where are used
    // for formatting, with currentUser being sent if sender of
    // the message matches the user's name in the userInformation
    // object, and otherUsers if the message's sender does match
    // the the user's name in the userInformation
    // object. Where currentUser makes the massages appear on the
    // right, and otherUsers makes the users appear on the left.
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

// When the page has fully loaded, it will make
// an object of the Blather class, consenting of it's
// variables and methods.
window.onload = () => {
    new Blather();
}