/**
 * Tests for NeverquestQuestManager (quest FSM + Chapter 1 completion)
 */

import { NeverquestQuestManager } from '../../plugins/NeverquestQuestManager';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';
import { GameEvents, RegistryKeys } from '../../consts/Events';

jest.mock('phaser', () => ({
	__esModule: true,
	default: {
		Scenes: { Events: { SHUTDOWN: 'shutdown', DESTROY: 'destroy' } },
	},
}));

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

function makeScene(storyFlags: ReturnType<typeof makeStoryFlags>) {
	const events = makeBus();
	return {
		events,
		registry: {
			get: jest.fn((key: string) => (key === RegistryKeys.STORY_FLAGS ? storyFlags : undefined)),
		},
	} as any;
}

/** Helper: count emits of a given event on a scene's bus. */
function emitsOf(scene: any, eventName: string): unknown[][] {
	return scene.events.emit.mock.calls.filter((call: unknown[]) => call[0] === eventName);
}

describe('NeverquestQuestManager', () => {
	it('marks the first quest active and the rest not-started on a fresh game', () => {
		const scene = makeScene(makeStoryFlags());
		const qm = new NeverquestQuestManager(scene);

		qm.create();

		expect(qm.getState('intro')).toBe('active');
		expect(qm.getState('meet_elder')).toBe('not-started');
		expect(qm.getState('cave_boss')).toBe('not-started');
	});

	it('emits questChanged with the first active quest on create', () => {
		const scene = makeScene(makeStoryFlags());
		new NeverquestQuestManager(scene).create();

		const changes = emitsOf(scene, GameEvents.QUEST_CHANGED);
		expect(changes).toContainEqual([GameEvents.QUEST_CHANGED, { questId: 'intro', state: 'active' }]);
	});

	it('advances the chain: completing intro activates meet_elder', () => {
		const storyFlags = makeStoryFlags();
		const scene = makeScene(storyFlags);
		const qm = new NeverquestQuestManager(scene);
		qm.create();

		// The bridge would set the flag then emit FLAG_WRITTEN; simulate that.
		storyFlags.set.add(StoryFlag.INTRO_COMPLETE);
		scene.events.emit(GameEvents.FLAG_WRITTEN, StoryFlag.INTRO_COMPLETE);

		expect(qm.getState('intro')).toBe('complete');
		expect(qm.getState('meet_elder')).toBe('active');
		expect(emitsOf(scene, GameEvents.QUEST_CHANGED)).toContainEqual([
			GameEvents.QUEST_CHANGED,
			{ questId: 'meet_elder', state: 'active' },
		]);
	});

	it('completes Chapter 1 when all four Act 1 quests are done', () => {
		const storyFlags = makeStoryFlags();
		const scene = makeScene(storyFlags);
		const qm = new NeverquestQuestManager(scene);
		qm.create();

		[
			StoryFlag.INTRO_COMPLETE,
			StoryFlag.MET_ELDER,
			StoryFlag.CAVE_ARTIFACT_RETRIEVED,
			StoryFlag.CAVE_BOSS_DEFEATED,
		].forEach((flag) => {
			storyFlags.set.add(flag);
			scene.events.emit(GameEvents.FLAG_WRITTEN, flag);
		});

		expect(storyFlags.setFlag).toHaveBeenCalledWith(StoryFlag.ACT_1_COMPLETE);
		expect(emitsOf(scene, GameEvents.CHAPTER_COMPLETE)).toHaveLength(1);
		expect(qm.getState('cave_boss')).toBe('complete');
	});

	it('does not emit chapterComplete more than once', () => {
		const storyFlags = makeStoryFlags();
		const scene = makeScene(storyFlags);
		const qm = new NeverquestQuestManager(scene);
		qm.create();

		[
			StoryFlag.INTRO_COMPLETE,
			StoryFlag.MET_ELDER,
			StoryFlag.CAVE_ARTIFACT_RETRIEVED,
			StoryFlag.CAVE_BOSS_DEFEATED,
		].forEach((flag) => storyFlags.set.add(flag));
		// Two evaluations after completion
		qm.evaluate();
		qm.evaluate();

		expect(emitsOf(scene, GameEvents.CHAPTER_COMPLETE)).toHaveLength(1);
	});

	it('does nothing when no shared storyFlags exist', () => {
		const scene = {
			events: makeBus(),
			registry: { get: jest.fn((): unknown => undefined) },
		} as any;
		const qm = new NeverquestQuestManager(scene);

		expect(() => qm.create()).not.toThrow();
		expect(qm.getState('intro')).toBe('not-started');
	});
});
