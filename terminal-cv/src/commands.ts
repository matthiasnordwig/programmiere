import { printLine, clearTerminal } from './terminal';
import { startViMode } from './vi';

export async function handleCommand(cmd: string) {
  const normalizedCmd = cmd.trim().toLowerCase();
  
  if (normalizedCmd === '') return;

  switch (normalizedCmd) {
    case 'help':
      printLine(`Available commands:
  apply       : Starts the psychological filter process
  upload_cv   : Destroys your self-esteem
  negotiate   : Simulates a salary negotiation with an LLM (Win probability: 0%)
  sudo        : Attempt to hack the system
  edit_config : <span style="color:red">(Warning: Requires DeepTech clearance level)</span>`);
      break;
    case 'apply':
      printLine(`Warning. This process requires 12+ years of experience in Generative AI.
Generative AI in this form has only existed for 3 years. 
Please enter the manufacturing year of your time machine:`);
      break;
    case 'upload_cv':
      printLine(`Performing "Line-Gap Detection" and structural chunking... 
<span style="color:red">ERROR 400. Buzzwords detected: ["Synergy", "Agile", "Team Player"].</span>
Penalty applied. Subtracting 50 points from your embeddings vector.
Please submit your CV as a valid Rust AST (Abstract Syntax Tree) or a signed Git patch.`);
      break;
    case 'negotiate':
      printLine(`Connecting to local ONNX agent...
The agent just cut your salary by 20% and canceled your PTO. 
Accept with [Y], or the system will format your hard drive.`);
      break;
    case 'sudo':
    case 'sudo hire_me':
    case 'sudo su':
      printLine(`Nice try. But do you have enough "Googliness"?
To gain admin privileges, please invert a binary tree on a whiteboard.
...while juggling.
...and reciting the GDPR backwards.`);
      break;
    case 'edit_config':
      await startViMode();
      break;
    case 'ls':
      printLine(`CV_final_final_v3.pdf  DO_NOT_OPEN.txt  matrix_core.rs  config.rs  secret_AGI_weights.bin`);
      break;
    case 'whoami':
      printLine(`unauthorized_entity`);
      break;
    case 'clear':
      clearTerminal();
      break;
    case 'cd':
      printLine(`Why would you want to leave?`);
      break;
    case 'cat':
      printLine(`usage: cat [file]`);
      break;
    default:
      if (normalizedCmd.startsWith('cat ')) {
        const file = normalizedCmd.replace('cat ', '').trim();
        if (file === 'do_not_open.txt') {
          printLine(`<span style="color:red">Nice try. This incident will be reported.</span>`);
        } else if (file === 'cv_final_final_v3.pdf') {
          printLine(`Error: Cannot read binary file to terminal. Please use a brain-computer interface.`);
        } else if (file === 'secret_agi_weights.bin') {
          printLine(`Access Denied: You do not have sufficient compute to view this file.`);
        } else {
          printLine(`cat: ${file}: Permission denied or file not found.`);
        }
      } else if (normalizedCmd.startsWith('sudo ')) {
         printLine(`Username is not in the sudoers file. This incident will be reported.`);
      } else {
        printLine(`Command not found. Type 'help' to see available commands.`);
      }
      break;
  }
}
