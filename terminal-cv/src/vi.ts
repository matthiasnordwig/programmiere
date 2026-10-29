import { app, clearTerminal } from './terminal';
import { revealBusinessCard } from './main';

export function startViMode(): Promise<void> {
  return new Promise((resolve) => {
    clearTerminal();
    
    const viContainer = document.createElement('div');
    viContainer.className = 'vi-container';
    
    const linesContainer = document.createElement('div');
    linesContainer.className = 'vi-lines';
    
    // Fill screen with tildes
    const numTildes = Math.floor(window.innerHeight / 24) - 2; // Rough estimate based on line-height
    for (let i = 0; i < Math.max(10, numTildes); i++) {
      const tilde = document.createElement('div');
      tilde.className = 'vi-tilde';
      tilde.textContent = '~';
      linesContainer.appendChild(tilde);
    }
    
    const statusBar = document.createElement('div');
    statusBar.className = 'vi-status-bar';
    statusBar.textContent = '"/tmp/matrix_core/config.rs" [vi-mode] 1L, 1C';
    
    viContainer.appendChild(linesContainer);
    viContainer.appendChild(statusBar);
    app.appendChild(viContainer);
    
    let keyBuffer = '';
    let randomKeyCount = 0;
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
      
      keyBuffer += e.key;
      randomKeyCount++;
      
      const exitVi = () => {
        document.removeEventListener('keydown', handleKeydown);
        clearTerminal();
        revealBusinessCard();
        resolve();
      };

      if (e.key === 'Enter') {
        const isEnterCommand = [':wq', ':q', ':q!', ':x'].some(cmd => keyBuffer.endsWith(cmd + 'Enter'));
        if (isEnterCommand) {
          exitVi();
          return;
        } else {
          keyBuffer = '';
        }
      } else {
        const isDirectCommand = ['ZZ', 'ZQ'].some(cmd => keyBuffer.endsWith(cmd));
        if (isDirectCommand) {
          exitVi();
          return;
        }
      }
      
      if (keyBuffer.length > 20) {
        keyBuffer = keyBuffer.slice(-20);
      }
      
      if (randomKeyCount > 5) {
        statusBar.textContent = '> [System]: Trapped in vi? Classic. Try \':q\' or \':wq\' and press Enter to save yourself.';
        statusBar.classList.add('vi-warning');
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
  });
}
