#!/usr/bin/env node
import { TerminalGame } from './src/terminal/TerminalGame';

// Parse command line arguments
const args = process.argv.slice(2);
const debug = args.includes('--debug') || args.includes('-d');

// Create and start the game
const game = new TerminalGame(debug);
game.start();

// Handle process exit
process.on('SIGINT', () => {
	game.stop();
	process.exit(0);
});
