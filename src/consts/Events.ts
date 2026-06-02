/**
 * @fileoverview Centralized domain event names and Phaser Registry keys.
 *
 * These constants back the Chapter 1 narrative wiring ("event-bridge"):
 * gameplay code emits domain events on a scene's event bus; the
 * {@link NeverquestStoryFlagBridge} and {@link NeverquestQuestManager} listen
 * and translate them into story-flag writes and quest-state changes.
 *
 * Centralizing the strings here keeps emitters and listeners in sync and
 * satisfies the `lint:hardcoded` check (no magic event strings in logic).
 *
 * @module consts/Events
 */

/**
 * Domain event names emitted/consumed on Phaser scene event buses
 * (`scene.events`).
 */
export const GameEvents = {
	/**
	 * Request that a story flag be written.
	 * Payload: `StoryFlag`. Emitted by gameplay (abilities, NPC dialog,
	 * combat, item pickups); consumed by {@link NeverquestStoryFlagBridge}.
	 * Already emitted today by `NeverquestAbilityManager`.
	 */
	SET_STORY_FLAG: 'setStoryFlag',

	/**
	 * A story flag was just written to the shared store.
	 * Payload: `StoryFlag`. Emitted by the bridge; consumed by the quest FSM.
	 */
	FLAG_WRITTEN: 'flagWritten',

	/**
	 * A quest changed state.
	 * Payload: `{ questId: string; state: TQuestState }`. Emitted by the quest
	 * FSM; consumed by `QuestLogScene` to refresh its display.
	 */
	QUEST_CHANGED: 'questChanged',

	/**
	 * Chapter 1 has been completed (all Act 1 quests done).
	 * No payload. Consumed to launch the "Chapter 1 Complete" overlay.
	 */
	CHAPTER_COMPLETE: 'chapterComplete',

	/**
	 * A spell was unlocked (existing event, emitted by `NeverquestStoryFlags`).
	 * Payload: spell id string.
	 */
	SPELL_UNLOCKED: 'spellUnlocked',
} as const;

/**
 * Keys for the Phaser global Registry (`scene.registry` / `game.registry`),
 * which survives `scene.start()` and is shared across all scenes — the
 * cross-scene persistence keystone for Chapter 1.
 */
export const RegistryKeys = {
	/** The active scene's {@link NeverquestSaveManager} (read by GameOverScene + warp save-on-warp). */
	SAVE_MANAGER: 'saveManager',
	/** The shared {@link NeverquestStoryFlags} instance (read by bridge, quest manager, QuestLog, Journal). */
	STORY_FLAGS: 'storyFlags',
	/** The active {@link NeverquestQuestManager} (optional convenience handle). */
	QUEST_MANAGER: 'questManager',
} as const;

/** A single domain event name. */
export type TGameEvent = (typeof GameEvents)[keyof typeof GameEvents];
