/**
 * Tests for NeverquestStoryFlagBridge
 */

import { NeverquestStoryFlagBridge } from '../../plugins/NeverquestStoryFlagBridge';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';
import { GameEvents, RegistryKeys } from '../../consts/Events';

jest.mock('phaser', () => ({
	__esModule: true,
	default: {
		Scenes: { Events: { SHUTDOWN: 'shutdown', DESTROY: 'destroy' } },
	},
}));

/** A minimal synchronous event bus matching the bits of Phaser's EventEmitter we use. */
function makeBus() {
	const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
	return {
		on: jest.fn((ev: string, fn: (...args: unknown[]) => void) => {
			(listeners[ev] ||= []).push(fn);
		}),
		once: jest.fn((ev: string, fn: (...args: unknown[]) => void) => {
			(listeners[ev] ||= []).push(fn);
		}),
		off: jest.fn((ev: string, fn: (...args: unknown[]) => void) => {
			listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn);
		}),
		emit: jest.fn((ev: string, ...args: unknown[]) => {
			(listeners[ev] || []).slice().forEach((fn) => fn(...args));
		}),
	};
}

function makeStoryFlags() {
	const set = new Set<StoryFlag>();
	return {
		set,
		hasFlag: jest.fn((flag: StoryFlag) => set.has(flag)),
		setFlag: jest.fn((flag: StoryFlag) => {
			set.add(flag);
		}),
	};
}

function makeScene(storyFlags: ReturnType<typeof makeStoryFlags> | null) {
	const events = makeBus();
	return {
		events,
		registry: {
			get: jest.fn((key: string) => (key === RegistryKeys.STORY_FLAGS ? storyFlags : undefined)),
		},
	} as any;
}

describe('NeverquestStoryFlagBridge', () => {
	it('registers a SET_STORY_FLAG listener on create', () => {
		const scene = makeScene(makeStoryFlags());
		const bridge = new NeverquestStoryFlagBridge(scene);

		bridge.create();

		expect(scene.events.on).toHaveBeenCalledWith(GameEvents.SET_STORY_FLAG, expect.any(Function));
	});

	it('writes the flag and emits FLAG_WRITTEN when a SET_STORY_FLAG event fires', () => {
		const storyFlags = makeStoryFlags();
		const scene = makeScene(storyFlags);
		new NeverquestStoryFlagBridge(scene).create();

		scene.events.emit(GameEvents.SET_STORY_FLAG, StoryFlag.MET_ELDER);

		expect(storyFlags.setFlag).toHaveBeenCalledWith(StoryFlag.MET_ELDER);
		expect(scene.events.emit).toHaveBeenCalledWith(GameEvents.FLAG_WRITTEN, StoryFlag.MET_ELDER);
	});

	it('is idempotent: an already-set flag is not written or re-announced', () => {
		const storyFlags = makeStoryFlags();
		const scene = makeScene(storyFlags);
		new NeverquestStoryFlagBridge(scene).create();

		scene.events.emit(GameEvents.SET_STORY_FLAG, StoryFlag.MET_ELDER);
		scene.events.emit(GameEvents.SET_STORY_FLAG, StoryFlag.MET_ELDER);

		expect(storyFlags.setFlag).toHaveBeenCalledTimes(1);
		const flagWrittenCalls = scene.events.emit.mock.calls.filter(
			(call: unknown[]) => call[0] === GameEvents.FLAG_WRITTEN
		);
		expect(flagWrittenCalls).toHaveLength(1);
	});

	it('does not throw and drops the flag when no shared storyFlags exist', () => {
		const scene = makeScene(null);
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
		new NeverquestStoryFlagBridge(scene).create();

		expect(() => scene.events.emit(GameEvents.SET_STORY_FLAG, StoryFlag.MET_ELDER)).not.toThrow();
		const flagWrittenCalls = scene.events.emit.mock.calls.filter(
			(call: unknown[]) => call[0] === GameEvents.FLAG_WRITTEN
		);
		expect(flagWrittenCalls).toHaveLength(0);
		warnSpy.mockRestore();
	});

	it('removes its listener on destroy', () => {
		const scene = makeScene(makeStoryFlags());
		const bridge = new NeverquestStoryFlagBridge(scene);
		bridge.create();

		bridge.destroy();

		expect(scene.events.off).toHaveBeenCalledWith(GameEvents.SET_STORY_FLAG, expect.any(Function));
	});
});
