export const app = document.getElementById('app') as HTMLDivElement;

export function printLine(content: string | HTMLElement, className = '') {
  const line = document.createElement('div');
  line.className = `terminal-line ${className}`;
  if (typeof content === 'string') {
    line.innerHTML = content;
  } else {
    line.appendChild(content);
  }
  app.appendChild(line);
  scrollToBottom();
}

export function clearTerminal() {
  app.innerHTML = '';
}

export function scrollToBottom() {
  app.scrollTop = app.scrollHeight;
}

let currentInputResolve: ((val: string) => void) | null = null;
let currentPromptContainer: HTMLDivElement | null = null;
let hiddenInput: HTMLInputElement | null = null;

export function promptInput(prefix = 'user:~$ '): Promise<string> {
  return new Promise((resolve) => {
    currentInputResolve = resolve;

    currentPromptContainer = document.createElement('div');
    currentPromptContainer.className = 'prompt-container';

    const prefixEl = document.createElement('span');
    prefixEl.className = 'prompt-prefix';
    prefixEl.textContent = prefix;

    const inputDisplay = document.createElement('div');
    inputDisplay.className = 'input-display';

    const inputText = document.createElement('span');
    inputText.className = 'input-text';

    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.className = 'hidden-input';
    hiddenInput.setAttribute('autocomplete', 'off');
    hiddenInput.spellcheck = false;
    hiddenInput.setAttribute('autocapitalize', 'none');
    hiddenInput.setAttribute('autocorrect', 'off');

    // Event Listeners
    hiddenInput.addEventListener('input', (e) => {
      inputText.textContent = (e.target as HTMLInputElement).value;
      scrollToBottom();
    });

    hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = hiddenInput!.value.trim();
        removePrompt();
        printLine(`${prefix}${value}`);
        if (currentInputResolve) {
          currentInputResolve(value);
          currentInputResolve = null;
        }
      }
    });

    // Keep focus
    document.addEventListener('click', () => {
      if (hiddenInput && document.body.contains(hiddenInput)) {
        hiddenInput.focus();
      }
    });

    inputDisplay.appendChild(inputText);
    inputDisplay.appendChild(cursor);
    
    currentPromptContainer.appendChild(prefixEl);
    currentPromptContainer.appendChild(inputDisplay);
    currentPromptContainer.appendChild(hiddenInput);

    app.appendChild(currentPromptContainer);
    hiddenInput.focus();
    scrollToBottom();
  });
}

function removePrompt() {
  if (currentPromptContainer && currentPromptContainer.parentNode) {
    currentPromptContainer.parentNode.removeChild(currentPromptContainer);
  }
  currentPromptContainer = null;
  hiddenInput = null;
}
