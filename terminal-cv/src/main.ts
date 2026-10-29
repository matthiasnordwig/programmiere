import './style.css';
import { runBootSequence } from './boot';
import { promptInput, printLine } from './terminal';
import { handleCommand } from './commands';

let isTerminalMode = true;

export function revealBusinessCard() {
  isTerminalMode = false;
  const cardHtml = `
    <div>> "config.rs" written.</div>
    <div>> Authentication as 'Distinguished Engineer' successful.</div>
    <br />
    <div>> Joke aside. You passed the vibe check.</div>
    <div>> I am Matthias Nordwig, Applied AI Architect & Innovation Engineer.</div>
    <div>> I build offline-capable RAG architectures in Rust and scalable AI for enterprise clients.</div>
    <br />
    <div>> Let's talk. No tracking, no forms, purely privacy-preserving.</div>
    <div>> Send me an encrypted packet (or just an email):</div>
    <div>
      > <a href="mailto:matthias.nordwig@programmiere.de?subject=Passed%20the%20Null-Device%20Assessment">matthias.nordwig@programmiere.de</a>
    </div>
    <div>
      > <a href="https://www.linkedin.com/in/matthias-nordwig-989269191/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
    </div>
  `;
  
  const container = document.createElement('div');
  container.innerHTML = cardHtml;
  printLine(container);
}

async function startTerminalLoop() {
  while (isTerminalMode) {
    const cmd = await promptInput();
    await handleCommand(cmd);
  }
}

async function init() {
  await runBootSequence();
  startTerminalLoop();
}

// Start the application
init();
