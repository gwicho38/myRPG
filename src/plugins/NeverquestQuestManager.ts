/**
 * @fileoverview Quest state machine.
 *
 * Derives each quest's lifecycle state (`not-started → active → complete`) from
 * the shared story flags, reacting to FLAG_WRITTEN events. It owns two
 * responsibilities:
 *  1. Emit QUEST_CHANGED whenever a quest transitions, so the quest log can refresh.
 *  2. Detect Chapter 1 completion — when all four Act 1 quests are complete, set
 *     the ACT_1_COMPLETE flag and emit CHAPTER_COMPLETE (the victory beat).
 *
 * The quest log reads completion directly from story flags; this FSM provides
 * the change-event stream and the chapter-complete derivation on top of it.
 *
 * @see NeverquestStoryFlagBridge - writes the flags this FSM reacts to
 * @see module:consts/progression/QuestFlagMap - quest data + Act 1 chain
 *
 * @module plugins/NeverquestQuestManager
 */

import Phaser from 'phaser';
import { GameEvents, RegistryKeys } from '../consts/Events';
import { NeverquestStoryFlags, StoryFlag } from './NeverquestStoryFlags';
import { ACT_1_QUEST_CHAIN, QUEST_DEFINITIONS, QUEST_FLAG_MAP, TQuestState } from '../consts/progression/QuestFlagMap';

/**
 * Payload emitted with {@link GameEvents.QUEST_CHANGED}.
 */
export interface IQuestChangedPayload {
	questId: string;
	state: TQuestState;
}

/**
 * Tracks quest lifecycle states and drives Chapter 1 completion.
 */
export class NeverquestQuestManager {
	private scene: Phaser.Scene;
	private states: Map<string, TQuestState> = new Map();
	private readonly handler: () => void;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.handler = () => this.evaluate();
	}

	/**
	 * Takes an initial snapshot and subscribes to FLAG_WRITTEN. Call once in
	 * the gameplay scene's create().
	 */
	create(): void {
		this.evaluate();
		this.scene.events.on(GameEvents.FLAG_WRITTEN, this.handler);

		const shutdownEvent = Phaser.Scenes?.Events?.SHUTDOWN;
		if (shutdownEvent) {
			this.scene.events.once(shutdownEvent, () => this.destroy());
		}
	}

	/**
	 * Resolves the shared story-flag store from the Registry.
	 */
	private getStoryFlags(): NeverquestStoryFlags | null {
		return (this.scene.registry?.get(RegistryKeys.STORY_FLAGS) as NeverquestStoryFlags) || null;
	}

	/**
	 * Returns the current lifecycle state of a quest.
	 */
	getState(questId: string): TQuestState {
		return this.states.get(questId) || 'not-started';
	}

	/**
	 * Recomputes every quest's state from the current flags and emits
	 * QUEST_CHANGED for any transition, then checks for Chapter 1 completion.
	 */
	evaluate(): void {
		const storyFlags = this.getStoryFlags();
		if (!storyFlags) {
			return;
		}

		for (const quest of QUEST_DEFINITIONS) {
			const newState = this.computeState(quest.id, storyFlags);
			const prevState = this.states.get(quest.id);
			if (prevState !== newState) {
				this.states.set(quest.id, newState);
				this.emitQuestChanged(quest.id, newState);
			}
		}

		this.checkActOneComplete(storyFlags);
	}

	/**
	 * Computes a single quest's state. Act 1 quests form an ordered chain: each
	 * becomes `active` only once the previous one is `complete`. Quests outside
	 * the Act 1 chain are `complete` when their flag is set, else `not-started`.
	 */
	private computeState(questId: string, storyFlags: NeverquestStoryFlags): TQuestState {
		const flag = QUEST_FLAG_MAP[questId];
		if (flag && storyFlags.hasFlag(flag)) {
			return 'complete';
		}

		const chainIndex = ACT_1_QUEST_CHAIN.indexOf(questId);
		if (chainIndex === 0) {
			return 'active'; // first quest of the chapter is always available
		}
		if (chainIndex > 0) {
			const prevFlag = QUEST_FLAG_MAP[ACT_1_QUEST_CHAIN[chainIndex - 1]];
			const prevComplete = prevFlag ? storyFlags.hasFlag(prevFlag) : false;
			return prevComplete ? 'active' : 'not-started';
		}

		return 'not-started';
	}

	/**
	 * Sets ACT_1_COMPLETE and emits CHAPTER_COMPLETE once all Act 1 quests are done.
	 */
	private checkActOneComplete(storyFlags: NeverquestStoryFlags): void {
		if (storyFlags.hasFlag(StoryFlag.ACT_1_COMPLETE)) {
			return;
		}

		const allComplete = ACT_1_QUEST_CHAIN.every((questId) => {
			const flag = QUEST_FLAG_MAP[questId];
			return flag ? storyFlags.hasFlag(flag) : false;
		});

		if (allComplete) {
			storyFlags.setFlag(StoryFlag.ACT_1_COMPLETE);
			this.scene.events.emit(GameEvents.CHAPTER_COMPLETE);
		}
	}

	/**
	 * Emits a QUEST_CHANGED event on the scene bus.
	 */
	private emitQuestChanged(questId: string, state: TQuestState): void {
		const payload: IQuestChangedPayload = { questId, state };
		this.scene.events.emit(GameEvents.QUEST_CHANGED, payload);
	}

	/**
	 * Unsubscribes from events.
	 */
	destroy(): void {
		this.scene.events.off(GameEvents.FLAG_WRITTEN, this.handler);
	}
}
