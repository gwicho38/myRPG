import { NeverquestSoundManager } from '../../plugins/NeverquestSoundManager';

describe('NeverquestSoundManager', () => {
	let manager: NeverquestSoundManager;
	let mockScene: any;
	let mockMainAudioScene: any;
	let mockSound: any;

	beforeEach(() => {
		mockSound = {
			pauseAll: jest.fn(),
			resumeAll: jest.fn(),
			volume: 0.5,
		};

		mockMainAudioScene = {
			sound: mockSound,
		};

		mockScene = {
			scene: {
				get: jest.fn(() => mockMainAudioScene),
			},
		};

		manager = new NeverquestSoundManager(mockScene);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(manager['scene']).toBe(mockScene);
		});

		it('should set default mainAudioSceneName to "MainScene"', () => {
			expect(manager['mainAudioSceneName']).toBe('MainScene');
		});

		it('should initialize mainAudioScene as null', () => {
			expect(manager['mainAudioScene']).toBeNull();
		});
	});

	describe('create', () => {
		it('should retrieve MainScene from scene manager', () => {
			manager.create();

			expect(mockScene.scene.get).toHaveBeenCalledWith('MainScene');
		});

		it('should store mainAudioScene reference', () => {
			manager.create();

			expect(manager['mainAudioScene']).toBe(mockMainAudioScene);
		});

		it('should work when called multiple times', () => {
			manager.create();
			manager.create();

			expect(mockScene.scene.get).toHaveBeenCalledTimes(2);
			expect(manager['mainAudioScene']).toBe(mockMainAudioScene);
		});
	});

	describe('stopAllAudio', () => {
		it('should call pauseAll on mainAudioScene sound', () => {
			manager.create();
			manager.stopAllAudio();

			expect(mockSound.pauseAll).toHaveBeenCalled();
		});

		it('should not throw when mainAudioScene is null', () => {
			expect(() => {
				manager.stopAllAudio();
			}).not.toThrow();
		});

		it('should not call pauseAll when mainAudioScene is null', () => {
			manager.stopAllAudio();

			expect(mockSound.pauseAll).not.toHaveBeenCalled();
		});

		it('should call pauseAll after create is called', () => {
			manager.create();
			manager.stopAllAudio();

			expect(mockSound.pauseAll).toHaveBeenCalledTimes(1);
		});

		it('should be callable multiple times', () => {
			manager.create();
			manager.stopAllAudio();
			manager.stopAllAudio();
			manager.stopAllAudio();

			expect(mockSound.pauseAll).toHaveBeenCalledTimes(3);
		});
	});

	describe('resumeAllAudio', () => {
		it('should call resumeAll on mainAudioScene sound', () => {
			manager.create();
			manager.resumeAllAudio();

			expect(mockSound.resumeAll).toHaveBeenCalled();
		});

		it('should not throw when mainAudioScene is null', () => {
			expect(() => {
				manager.resumeAllAudio();
			}).not.toThrow();
		});

		it('should not call resumeAll when mainAudioScene is null', () => {
			manager.resumeAllAudio();

			expect(mockSound.resumeAll).not.toHaveBeenCalled();
		});

		it('should call resumeAll after create is called', () => {
			manager.create();
			manager.resumeAllAudio();

			expect(mockSound.resumeAll).toHaveBeenCalledTimes(1);
		});

		it('should be callable multiple times', () => {
			manager.create();
			manager.resumeAllAudio();
			manager.resumeAllAudio();
			manager.resumeAllAudio();

			expect(mockSound.resumeAll).toHaveBeenCalledTimes(3);
		});
	});

	describe('setVolume', () => {
		it('should set volume on mainAudioScene sound', () => {
			manager.create();
			manager.setVolume(0.75);

			expect(mockSound.volume).toBe(0.75);
		});

		it('should set volume to 0', () => {
			manager.create();
			manager.setVolume(0);

			expect(mockSound.volume).toBe(0);
		});

		it('should set volume to 1', () => {
			manager.create();
			manager.setVolume(1);

			expect(mockSound.volume).toBe(1);
		});

		it('should set volume to 0.5', () => {
			manager.create();
			manager.setVolume(0.5);

			expect(mockSound.volume).toBe(0.5);
		});

		it('should not throw when mainAudioScene is null', () => {
			expect(() => {
				manager.setVolume(0.5);
			}).not.toThrow();
		});

		it('should not set volume when mainAudioScene is null', () => {
			mockSound.volume = 0.5;
			manager.setVolume(0.8);

			expect(mockSound.volume).toBe(0.5); // Unchanged
		});

		it('should handle decimal values', () => {
			manager.create();
			manager.setVolume(0.12345);

			expect(mockSound.volume).toBe(0.12345);
		});

		it('should update volume multiple times', () => {
			manager.create();

			manager.setVolume(0.2);
			expect(mockSound.volume).toBe(0.2);

			manager.setVolume(0.6);
			expect(mockSound.volume).toBe(0.6);

			manager.setVolume(1.0);
			expect(mockSound.volume).toBe(1.0);
		});

		it('should allow values above 1', () => {
			manager.create();
			manager.setVolume(1.5);

			expect(mockSound.volume).toBe(1.5);
		});

		it('should allow negative values', () => {
			manager.create();
			manager.setVolume(-0.5);

			expect(mockSound.volume).toBe(-0.5);
		});
	});

	describe('getVolume', () => {
		it('should return current volume', () => {
			manager.create();
			mockSound.volume = 0.75;

			expect(manager.getVolume()).toBe(0.75);
		});

		it('should return 0 when volume is 0', () => {
			manager.create();
			mockSound.volume = 0;

			expect(manager.getVolume()).toBe(0);
		});

		it('should return 1 when volume is 1', () => {
			manager.create();
			mockSound.volume = 1;

			expect(manager.getVolume()).toBe(1);
		});

		it('should return updated volume after setVolume', () => {
			manager.create();
			manager.setVolume(0.3);

			expect(manager.getVolume()).toBe(0.3);
		});

		it('should reflect volume changes made directly to sound', () => {
			manager.create();
			mockSound.volume = 0.9;

			expect(manager.getVolume()).toBe(0.9);
		});
	});

	describe('Integration', () => {
		it('should handle complete audio control flow', () => {
			manager.create();

			// Set initial volume
			manager.setVolume(0.7);
			expect(manager.getVolume()).toBe(0.7);

			// Stop all audio
			manager.stopAllAudio();
			expect(mockSound.pauseAll).toHaveBeenCalled();

			// Resume all audio
			manager.resumeAllAudio();
			expect(mockSound.resumeAll).toHaveBeenCalled();

			// Change volume
			manager.setVolume(0.3);
			expect(manager.getVolume()).toBe(0.3);
		});

		it('should handle stop and resume cycle', () => {
			manager.create();

			manager.stopAllAudio();
			expect(mockSound.pauseAll).toHaveBeenCalledTimes(1);

			manager.resumeAllAudio();
			expect(mockSound.resumeAll).toHaveBeenCalledTimes(1);

			manager.stopAllAudio();
			expect(mockSound.pauseAll).toHaveBeenCalledTimes(2);

			manager.resumeAllAudio();
			expect(mockSound.resumeAll).toHaveBeenCalledTimes(2);
		});

		it('should maintain volume across stop/resume', () => {
			manager.create();

			manager.setVolume(0.8);
			manager.stopAllAudio();
			expect(manager.getVolume()).toBe(0.8);

			manager.resumeAllAudio();
			expect(manager.getVolume()).toBe(0.8);
		});

		it('should work correctly when scene is retrieved multiple times', () => {
			manager.create();
			manager.setVolume(0.5);

			manager.create(); // Re-create
			manager.setVolume(0.9);

			expect(manager.getVolume()).toBe(0.9);
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing mainAudioScene gracefully for all operations', () => {
			// Don't call create()
			expect(() => {
				manager.stopAllAudio();
				manager.resumeAllAudio();
				manager.setVolume(0.5);
			}).not.toThrow();
		});

		it('should handle scene.get returning null', () => {
			mockScene.scene.get.mockReturnValue(null);

			manager.create();

			expect(() => {
				manager.stopAllAudio();
				manager.resumeAllAudio();
				manager.setVolume(0.5);
			}).not.toThrow();
		});

		it('should handle scene.get returning undefined', () => {
			mockScene.scene.get.mockReturnValue(undefined);

			manager.create();

			expect(() => {
				manager.stopAllAudio();
				manager.resumeAllAudio();
				manager.setVolume(0.5);
			}).not.toThrow();
		});
	});
});
