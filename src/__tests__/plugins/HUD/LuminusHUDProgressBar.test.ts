import { LuminusHUDProgressBar } from '../../../plugins/HUD/LuminusHUDProgressBar';

describe('LuminusHUDProgressBar', () => {
	let progressBar: LuminusHUDProgressBar;
	let mockScene: any;
	let mockPlayer: any;
	let mockHealthBarSprite: any;
	let mockHealthBarBackground: any;
	let mockSpBarSprite: any;
	let mockSpBarBackground: any;
	let mockExpBarSprite: any;
	let mockExpBarBackground: any;
	let updateCallback: any;

	beforeEach(() => {
		// Mock image objects
		mockHealthBarSprite = {
			setOrigin: jest.fn().mockReturnThis(),
			setTexture: jest.fn(),
			scaleX: 1,
			visible: true,
			active: true,
		};

		mockHealthBarBackground = {
			setOrigin: jest.fn().mockReturnThis(),
			width: 100,
			height: 10,
		};

		mockSpBarSprite = {
			setOrigin: jest.fn().mockReturnThis(),
		};

		mockSpBarBackground = {
			setOrigin: jest.fn().mockReturnThis(),
		};

		mockExpBarSprite = {
			setOrigin: jest.fn().mockReturnThis(),
			setDisplaySize: jest.fn(),
			width: 100,
			height: 10,
			widthExtended: 0,
		};

		mockExpBarBackground = {
			setOrigin: jest.fn().mockReturnThis(),
			setDisplaySize: jest.fn(),
			width: 200,
			height: 10,
			scaleX: 1,
		};

		let imageCallCount = 0;
		const imageResponses = [
			mockHealthBarBackground,
			mockHealthBarSprite,
			mockSpBarBackground,
			mockSpBarSprite,
			mockExpBarBackground,
			mockExpBarSprite,
		];

		// Mock scene
		mockScene = {
			add: {
				image: jest.fn(() => imageResponses[imageCallCount++]),
			},
			events: {
				on: jest.fn((event, callback) => {
					if (event === 'update') {
						updateCallback = callback;
					}
				}),
			},
		};

		// Mock player
		mockPlayer = {
			attributes: {
				health: 100,
				baseHealth: 100,
				experience: 0,
				nextLevelExperience: 100,
			},
			scene: mockScene,
			luminusHUDProgressBar: null,
		};

		progressBar = new LuminusHUDProgressBar(mockScene, 10, 20, 80, mockPlayer);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene and player', () => {
			expect(progressBar.scene).toBe(mockScene);
			expect(progressBar.player).toBe(mockPlayer);
		});

		it('should set default sprite names', () => {
			expect(progressBar.greenBarSpriteName).toBe('green_bar');
			expect(progressBar.yellowBarSpriteName).toBe('yellow_bar');
			expect(progressBar.redBarSpriteName).toBe('red_bar');
			expect(progressBar.blueBarSpriteName).toBe('blue_bar');
			expect(progressBar.expBlueBarSpriteName).toBe('exp_blue_bar');
			expect(progressBar.progressBarBackgroundSpriteName).toBe('progressbar_background');
		});

		it('should create health bar background at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 + 80 / 2 + 15, // x + width/2 + 15 = 10 + 40 + 15 = 65
				20, // y
				'progressbar_background'
			);
			expect(mockHealthBarBackground.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should create health bar sprite at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 + 80 / 2 + 20, // x + width/2 + 20 = 10 + 40 + 20 = 70
				20, // y
				'green_bar'
			);
			expect(mockHealthBarSprite.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should create SP bar background at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 + 80 / 2 + 15, // 65
				20 + 20, // y + 20 = 40
				'progressbar_background'
			);
			expect(mockSpBarBackground.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should create SP bar sprite at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 + 80 / 2 + 20, // 70
				20 + 20, // 40
				'blue_bar'
			);
			expect(mockSpBarSprite.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should create exp bar background at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 - 10, // x - 10 = 0
				20 + 40, // y + 40 = 60
				'progressbar_background'
			);
			expect(mockExpBarBackground.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should resize exp bar background correctly', () => {
			expect(mockExpBarBackground.setDisplaySize).toHaveBeenCalledWith(
				200 + 80 / 2 + 25, // width + width/2 + 25 = 200 + 40 + 25 = 265
				10 // height
			);
		});

		it('should create exp bar sprite at correct position', () => {
			expect(mockScene.add.image).toHaveBeenCalledWith(
				10 - 5, // x - 5 = 5
				20 + 40, // y + 40 = 60
				'exp_blue_bar'
			);
			expect(mockExpBarSprite.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});

		it('should calculate and store widthExtended', () => {
			expect(mockExpBarSprite.widthExtended).toBe((200 - 8) * 1); // (width - 8) * scaleX = 192
		});

		it('should resize exp bar sprite correctly', () => {
			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				(200 - 8) * 1, // (width - 8) * scaleX = 192
				10 // height
			);
		});

		it('should attach progressbar to player', () => {
			expect(mockPlayer.luminusHUDProgressBar).toBe(progressBar);
		});

		it('should register update event listener', () => {
			expect(mockScene.events.on).toHaveBeenCalledWith('update', expect.any(Function), progressBar);
		});

		it('should initialize health as null', () => {
			expect(progressBar.health).toBeNull();
		});
	});

	describe('updateHealth', () => {
		describe('Health Bar Color Changes', () => {
			it('should use green bar when health > 40%', () => {
				mockPlayer.attributes.health = 50;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('green_bar');
			});

			it('should use green bar at exactly 41%', () => {
				mockPlayer.attributes.health = 41;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('green_bar');
			});

			it('should use yellow bar when health is 40%', () => {
				mockPlayer.attributes.health = 40;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar');
			});

			it('should use yellow bar when health is 20%', () => {
				mockPlayer.attributes.health = 20;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar');
			});

			it('should use yellow bar when health is between 20-40%', () => {
				mockPlayer.attributes.health = 30;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar');
			});

			it('should use red bar when health < 20%', () => {
				mockPlayer.attributes.health = 19;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('red_bar');
			});

			it('should use red bar when health is 1', () => {
				mockPlayer.attributes.health = 1;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('red_bar');
			});
		});

		describe('Health Bar Scale', () => {
			it('should set scaleX to 1.0 when health is 100%', () => {
				mockPlayer.attributes.health = 100;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.scaleX).toBe(1.0);
			});

			it('should set scaleX to 0.5 when health is 50%', () => {
				mockPlayer.attributes.health = 50;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.scaleX).toBe(0.5);
			});

			it('should set scaleX to 0.25 when health is 25%', () => {
				mockPlayer.attributes.health = 25;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.scaleX).toBe(0.25);
			});

			it('should set scaleX to 0.01 when health is 1%', () => {
				mockPlayer.attributes.health = 1;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.scaleX).toBe(0.01);
			});
		});

		describe('Edge Cases', () => {
			it('should handle 0 health', () => {
				mockPlayer.attributes.health = 0;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.scaleX).toBe(0);
			});

			it('should handle full health', () => {
				mockPlayer.attributes.health = 100;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('green_bar');
				expect(mockHealthBarSprite.scaleX).toBe(1.0);
			});

			it('should handle health exceeding baseHealth', () => {
				mockPlayer.attributes.health = 150;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('green_bar');
				expect(mockHealthBarSprite.scaleX).toBe(1.5);
			});

			it('should handle fractional health values', () => {
				mockPlayer.attributes.health = 33.5;
				mockPlayer.attributes.baseHealth = 100;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar');
				expect(mockHealthBarSprite.scaleX).toBe(0.335);
			});

			it('should handle different baseHealth values', () => {
				mockPlayer.attributes.health = 50;
				mockPlayer.attributes.baseHealth = 200;

				progressBar.updateHealth();

				expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar'); // 25%
				expect(mockHealthBarSprite.scaleX).toBe(0.25);
			});
		});
	});

	describe('updateExp', () => {
		it('should update exp bar to full when experience equals nextLevelExperience', () => {
			mockPlayer.attributes.experience = 100;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 1.0, // 100%
				mockExpBarSprite.height
			);
		});

		it('should update exp bar to 50% when experience is half of next level', () => {
			mockPlayer.attributes.experience = 50;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 0.5, // 50%
				mockExpBarSprite.height
			);
		});

		it('should update exp bar to 0% when experience is 0', () => {
			mockPlayer.attributes.experience = 0;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 0, // 0%
				mockExpBarSprite.height
			);
		});

		it('should update exp bar to 75% when experience is 75 of 100', () => {
			mockPlayer.attributes.experience = 75;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 0.75, // 75%
				mockExpBarSprite.height
			);
		});

		it('should handle fractional experience values', () => {
			mockPlayer.attributes.experience = 33.33;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 0.3333, // 33.33%
				mockExpBarSprite.height
			);
		});

		it('should handle different nextLevelExperience values', () => {
			mockPlayer.attributes.experience = 250;
			mockPlayer.attributes.nextLevelExperience = 500;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 0.5, // 50%
				mockExpBarSprite.height
			);
		});

		it('should handle experience exceeding nextLevelExperience', () => {
			mockPlayer.attributes.experience = 150;
			mockPlayer.attributes.nextLevelExperience = 100;

			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledWith(
				mockExpBarSprite.widthExtended! * 1.5, // 150%
				mockExpBarSprite.height
			);
		});
	});

	describe('updateHud', () => {
		it('should call updateExp', () => {
			const updateExpSpy = jest.spyOn(progressBar, 'updateExp');

			progressBar.updateHud();

			expect(updateExpSpy).toHaveBeenCalled();
		});

		it('should be called on scene update event', () => {
			expect(updateCallback).toBe(progressBar.updateHud);
		});
	});

	describe('Custom Sprite Names', () => {
		it('should allow custom green bar sprite name', () => {
			progressBar.greenBarSpriteName = 'custom_green';
			mockPlayer.attributes.health = 100; // green range
			progressBar.updateHealth();

			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('custom_green');
		});

		it('should allow custom yellow bar sprite name', () => {
			progressBar.yellowBarSpriteName = 'custom_yellow';
			mockPlayer.attributes.health = 30; // yellow range

			progressBar.updateHealth();

			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('custom_yellow');
		});

		it('should allow custom red bar sprite name', () => {
			progressBar.redBarSpriteName = 'custom_red';
			mockPlayer.attributes.health = 10; // red range

			progressBar.updateHealth();

			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('custom_red');
		});
	});

	describe('Integration', () => {
		it('should maintain state across multiple health updates', () => {
			mockPlayer.attributes.health = 100;
			progressBar.updateHealth();
			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('green_bar');

			mockPlayer.attributes.health = 30;
			progressBar.updateHealth();
			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('yellow_bar');

			mockPlayer.attributes.health = 10;
			progressBar.updateHealth();
			expect(mockHealthBarSprite.setTexture).toHaveBeenCalledWith('red_bar');
		});

		it('should maintain state across multiple exp updates', () => {
			mockPlayer.attributes.experience = 0;
			progressBar.updateExp();

			mockPlayer.attributes.experience = 50;
			progressBar.updateExp();

			mockPlayer.attributes.experience = 100;
			progressBar.updateExp();

			expect(mockExpBarSprite.setDisplaySize).toHaveBeenCalledTimes(4); // 1 in constructor + 3 manual calls
		});

		it('should update both health and exp independently', () => {
			const updateHealthSpy = jest.spyOn(progressBar, 'updateHealth');
			const updateExpSpy = jest.spyOn(progressBar, 'updateExp');

			progressBar.updateHealth();
			progressBar.updateHud();

			expect(updateHealthSpy).toHaveBeenCalled();
			expect(updateExpSpy).toHaveBeenCalled();
		});
	});
});
