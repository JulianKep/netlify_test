const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  document.getElementById('status').textContent =
    'This browser does not support the Web Speech API. Use Chrome or Edge.';
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;      // keep listening until stopped
  recognition.interimResults = false; // only final results
  recognition.lang = 'en-US';         // change if needed, e.g. 'de-DE'

  const status = document.getElementById('status');
  const output = document.getElementById('output');
  let transcript = '';

  recognition.onstart = () => {
    status.textContent = 'Listening...';
  };

  recognition.onresult = (event) => {
    transcript = '';
    for (const result of event.results) {
      transcript += result[0].transcript;
    }
    output.textContent = transcript;   // update the page as speech comes in
  };

  recognition.onerror = (event) => {
    console.log('SPEECH ERROR:', event.error);
    status.textContent = 'Error: ' + event.error;
  };

  recognition.onend = () => {
    console.log('TRANSCRIPT:', JSON.stringify(transcript));
    status.textContent = 'Stopped. Heard: ' + (transcript || '(nothing)');
    output.textContent = transcript || '(nothing heard)';
  };

  document.getElementById('start').onclick = () => {
    transcript = '';
    output.textContent = '';
    recognition.start();
  };

  document.getElementById('stop').onclick = () => {
    recognition.stop();   // triggers onend, which logs the result
  };
}