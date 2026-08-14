const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const statusText = document.getElementById('statusText');
const dot = document.getElementById('dot');
const output = document.getElementById('output');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

if (!SpeechRecognition) {
  statusText.textContent =
    'This browser does not support the Web Speech API. Use Chrome or Edge.';
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  let transcript = '';

  recognition.onstart = () => {
    statusText.textContent = 'Listening... (speak now)';
    dot.style.background = '#e53935';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onresult = (event) => {
    transcript = '';
    for (const result of event.results) {
      transcript += result[0].transcript;
    }
    output.textContent = transcript;
  };

  recognition.onerror = (event) => {
    console.log('SPEECH ERROR:', event.error);
    statusText.textContent = 'Error: ' + event.error;
    dot.style.background = '#999';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recognition.onend = () => {
    console.log('TRANSCRIPT:', JSON.stringify(transcript));
    // don't overwrite an error message
    if (!statusText.textContent.startsWith('Error')) {
      statusText.textContent = 'Stopped. Heard: ' + (transcript || '(nothing)');
    }
    dot.style.background = '#999';
    output.textContent = transcript || '(nothing heard)';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  startBtn.onclick = () => {
    transcript = '';
    output.textContent = '';
    statusText.textContent = 'Starting... (waiting for mic)';  // immediate feedback
    dot.style.background = '#fb8c00';                           // orange = pending
    console.log('Start clicked');
    try {
      recognition.start();
    } catch (e) {
      console.log('start() threw:', e.message);
      statusText.textContent = 'start() failed: ' + e.message;
      dot.style.background = '#999';
    }
  };

  stopBtn.onclick = () => {
    recognition.stop();
  };
}