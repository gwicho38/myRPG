/**
 * @fileoverview Story-flag event bridge.
 *
 * The single listener that turns gameplay `setStoryFlag` events into writes
 * against the shared {@link NeverquestStoryFlags} instance held in the Phaser
 * Registry. Gameplay code (abilities, NPC dialog, combat, item pickups) only
 * needs to emit `GameEvents.SET_STORY_FLAG` with a `StoryFlag` payload — it
 * never touches the flag store directly. This keeps narrative wiring
 * event-driven and centralized (see CLAUDE.md state-ownership rules).
 *
 * Flow: gameplay emits SET_STORY_FLAG → bridge writes the flag → bridge emits
 * FLAG_WRITTEN → {@link NeverquestQuestManager} re-evaluates quest state.
 *
 * @module plugins/NeverquestStoryFlagBridge
 */

import Phaser from 'phaser';
import { GameEvents, RegistryKeys } from '../consts/Events';
import { NeverquestStoryFlags, StoryFlag } from './NeverquestStoryFlags';

/**
 * Listens for story-flag requests on a scene's event bus and applies them to
 * the shared story-flag store.
 */
export class NeverquestStoryFlagBridge {
	private scene: Phaser.Scene;
	private readonly handler: (flag: StoryFlag) => void;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.handler = (flag: StoryFlag) => this.onSetStoryFlag(flag);
	}

	/**
	 * Registers the listener on the scene's event bus. Call once in the
	 * gameplay scene's create().
	 */
	create(): void {
		this.scene.events.on(GameEvents.SET_STORY_FLAG, this.handler);

		// Auto-clean on scene shutdown to avoid duplicate listeners across
		// scene restarts. Guarded so unit/headless environments without the
		// Phaser.Scenes namespace do not throw.
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
	 * Handles a SET_STORY_FLAG event: writes the flag (idempotently) and
	 * announces FLAG_WRITTEN so downstream systems can react.
	 */
	onSetStoryFlag(flag: StoryFlag): void {
		const storyFlags = this.getStoryFlags();
		if (!storyFlags) {
			console.warn('[StoryFlagBridge] No shared storyFlags in registry; flag dropped:', flag);
			return;
		}

		// Idempotent: a flag already set should not re-run its onFlagSet cascade.
		if (storyFlags.hasFlag(flag)) {
			return;
		}

		storyFlags.setFlag(flag);
		this.scene.events.emit(GameEvents.FLAG_WRITTEN, flag);
	}

	/**
	 * Removes the listener.
	 */
	destroy(): void {
		this.scene.events.off(GameEvents.SET_STORY_FLAG, this.handler);
	}
}
