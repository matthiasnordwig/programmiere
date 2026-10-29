import { printLine } from './terminal';

const bootLines = [
  "> Booting Null-Device Recruiting Gate...",
  "> Loading matrix_core... Allocating f32-BLOBs... [OK]",
  "> Bypassing HR logic... [OK]",
  "> Loading 'Corporate PowerPoint Architecture'... <span style='color:red'>[FAILED - Actual code required]</span>",
  "> Welcome to the Frontier.",
  "> Type 'help' to start your career."
];

export async function runBootSequence(): Promise<void> {
  for (const line of bootLines) {
    printLine(line);
    // Random delay between 100ms and 400ms for realistic booting
    const delay = Math.floor(Math.random() * 300) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
