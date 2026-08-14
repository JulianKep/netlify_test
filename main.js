const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;   // keep listening until stopped

let transcript = '';

recognition.onresult = (event) => {
    transcript = '';
    for (const result of event.results) {
    transcript += result[0].transcript;
    }
};

recognition.onend = () => {
    console.log(transcript);       // print once listening ends
};

document.getElementById('start').onclick = () => {
    transcript = '';
    recognition.start();
};

document.getElementById('stop').onclick = () => {
    recognition.stop();            // triggers onend
};