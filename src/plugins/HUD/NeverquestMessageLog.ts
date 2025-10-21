import Phaser from 'phaser';

/**
 * Message log for displaying game events, combat results, and notifications
 * Similar to the terminal version's log system
 */
export class NeverquestMessageLog {
	private scene: Phaser.Scene;
	private container: Phaser.GameObjects.Container;
	private background: Phaser.GameObjects.Graphics;
	private messages: Phaser.GameObjects.Text[] = [];
	private maxMessages: number = 5; // Show last 5 messages
	private messageHistory: string[] = []; // Store all messages for scrolling
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private padding: number = 10;
	private lineHeight: number = 20;

	constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		// Create container for all log elements
		this.container = this.scene.add.container(x, y);
		this.container.setScrollFactor(0);
		this.container.setDepth(100);

		// Create semi-transparent background
		this.background = this.scene.add.graphics();
		this.background.fillStyle(0x000000, 0.7);
		this.background.fillRoundedRect(0, 0, width, height, 8);
		this.background.lineStyle(2, 0x444444, 1);
		this.background.strokeRoundedRect(0, 0, width, height, 8);
		this.container.add(this.background);

		// Create title text
		const titleText = this.scene.add.text(this.padding, this.padding, '⚔️ Game Log', {
			fontSize: '14px',
			color: '#ffff00',
			fontStyle: 'bold',
		});
		this.container.add(titleText);

		// Initialize message text objects
		for (let i = 0; i < this.maxMessages; i++) {
			const messageText = this.scene.add.text(this.padding, this.padding + 25 + i * this.lineHeight, '', {
				fontSize: '12px',
				color: '#ffffff',
				wordWrap: { width: width - this.padding * 2 },
			});
			this.messages.push(messageText);
			this.container.add(messageText);
		}
	}

	/**
	 * Add a message to the log
	 */
	public log(message: string, color: string = '#ffffff'): void {
		// Add to history
		this.messageHistory.push(message);

		// Keep only last 100 messages in history
		if (this.messageHistory.length > 100) {
			this.messageHistory.shift();
		}

		// Update displayed messages (show last N messages)
		const visibleMessages = this.messageHistory.slice(-this.maxMessages);
		for (let i = 0; i < this.maxMessages; i++) {
			if (i < visibleMessages.length) {
				this.messages[i].setText(visibleMessages[i]);
				this.messages[i].setColor(this.getMessageColor(visibleMessages[i]));
			} else {
				this.messages[i].setText('');
			}
		}
	}

	/**
	 * Get color based on message content
	 */
	private getMessageColor(message: string): string {
		if (message.includes('defeated') || message.includes('victory')) {
			return '#00ff00'; // Green for success
		}
		if (message.includes('damage') || message.includes('attack')) {
			return '#ff4444'; // Red for combat
		}
		if (message.includes('heal') || message.includes('restored')) {
			return '#44ff44'; // Light green for healing
		}
		if (message.includes('level up') || message.includes('XP')) {
			return '#ffff00'; // Yellow for progression
		}
		return '#ffffff'; // White for general messages
	}

	/**
	 * Clear all messages
	 */
	public clear(): void {
		this.messageHistory = [];
		for (const message of this.messages) {
			message.setText('');
		}
	}

	/**
	 * Set position of the log
	 */
	public setPosition(x: number, y: number): void {
		this.container.setPosition(x, y);
	}

	/**
	 * Set visibility
	 */
	public setVisible(visible: boolean): void {
		this.container.setVisible(visible);
	}

	/**
	 * Destroy the log
	 */
	public destroy(): void {
		this.container.destroy();
	}
}
