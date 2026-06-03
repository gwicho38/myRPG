/**
 * @fileoverview Quest definitions and quest→story-flag mapping.
 *
 * Extracted from `QuestLogScene` so both the quest-log UI and the
 * {@link NeverquestQuestManager} FSM share a single source of truth for the
 * 16-quest, 3-act structure and which `StoryFlag` marks each quest complete.
 *
 * @module consts/progression/QuestFlagMap
 */

import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

/**
 * Quest lifecycle states for the quest FSM.
 * - `not-started`: prerequisites not yet met
 * - `active`: available/in-progress (prerequisite complete, this one not)
 * - `complete`: the mapped story flag is set
 */
export type TQuestState = 'not-started' | 'active' | 'complete';

/**
 * A single quest entry for display and tracking.
 */
export interface IQuestEntry {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	act: 1 | 2 | 3;
}

/**
 * Quest definitions organized by act (16 quests across 3 acts).
 */
export const QUEST_DEFINITIONS: IQuestEntry[] = [
	// Act 1 - The Awakening
	{
		id: 'intro',
		title: 'Awakening',
		description: 'Regain your memories and speak with the village elder.',
		completed: false,
		act: 1,
	},
	{
		id: 'meet_elder',
		title: "The Elder's Request",
		description: 'Meet with the village elder to learn about the threat.',
		completed: false,
		act: 1,
	},
	{
		id: 'cave_artifact',
		title: 'The Stolen Artifact',
		description: 'Retrieve the artifact from the nearby cave.',
		completed: false,
		act: 1,
	},
	{
		id: 'cave_boss',
		title: 'Cave Guardian',
		description: 'Defeat the guardian protecting the artifact.',
		completed: false,
		act: 1,
	},

	// Act 2 - The Journey
	{
		id: 'crossroads',
		title: 'The Crossroads',
		description: 'Travel to the Crossroads, the central hub of the realm.',
		completed: false,
		act: 2,
	},
	{
		id: 'merchant',
		title: 'Meet the Merchant',
		description: 'Speak with the wandering merchant at the trading post.',
		completed: false,
		act: 2,
	},
	{
		id: 'fallen_knight',
		title: 'The Fallen Knight',
		description: 'Encounter the mysterious fallen knight.',
		completed: false,
		act: 2,
	},
	{
		id: 'oracle',
		title: 'Seek the Oracle',
		description: 'Find the Oracle of the Depths and receive the prophecy.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_ruins',
		title: 'Fragment of Ruins',
		description: 'Obtain the first Sunstone fragment from the Ancient Ruins.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_temple',
		title: 'Fragment of Temple',
		description: 'Obtain the second Sunstone fragment from the Forgotten Temple.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_gate',
		title: 'Fragment of Gate',
		description: 'Obtain the third Sunstone fragment near the Dark Gate.',
		completed: false,
		act: 2,
	},
	{
		id: 'sunstone',
		title: 'Restore the Sunstone',
		description: 'Combine all three fragments to restore the Sunstone.',
		completed: false,
		act: 2,
	},

	// Act 3 - The Reckoning
	{
		id: 'dark_gate',
		title: 'Open the Dark Gate',
		description: 'Use the restored Sunstone to open the Dark Gate.',
		completed: false,
		act: 3,
	},
	{
		id: 'citadel',
		title: 'Enter the Citadel',
		description: 'Brave the Dark Citadel to confront the Void King.',
		completed: false,
		act: 3,
	},
	{
		id: 'shadow_guardian',
		title: 'Shadow Guardian',
		description: 'Defeat the Shadow Guardian blocking the way.',
		completed: false,
		act: 3,
	},
	{
		id: 'void_king',
		title: 'The Void King',
		description: 'Confront the Void King and decide the fate of the realm.',
		completed: false,
		act: 3,
	},
];

/**
 * Mapping from quest IDs to the story flag that marks them complete.
 */
export const QUEST_FLAG_MAP: Record<string, StoryFlag> = {
	intro: StoryFlag.INTRO_COMPLETE,
	meet_elder: StoryFlag.MET_ELDER,
	cave_artifact: StoryFlag.CAVE_ARTIFACT_RETRIEVED,
	cave_boss: StoryFlag.CAVE_BOSS_DEFEATED,
	crossroads: StoryFlag.ENTERED_CROSSROADS,
	merchant: StoryFlag.MET_MERCHANT,
	fallen_knight: StoryFlag.MET_FALLEN_KNIGHT,
	oracle: StoryFlag.MET_ORACLE,
	fragment_ruins: StoryFlag.FRAGMENT_RUINS_OBTAINED,
	fragment_temple: StoryFlag.FRAGMENT_TEMPLE_OBTAINED,
	fragment_gate: StoryFlag.FRAGMENT_GATE_OBTAINED,
	sunstone: StoryFlag.SUNSTONE_RESTORED,
	dark_gate: StoryFlag.DARK_GATE_OPENED,
	citadel: StoryFlag.ENTERED_CITADEL,
	shadow_guardian: StoryFlag.SHADOW_GUARDIAN_DEFEATED,
	void_king: StoryFlag.VOID_KING_CONFRONTED,
};

/**
 * Ordered quest IDs for Act 1 ("The Awakening") — the Chapter 1 spine.
 * Each becomes `active` only once the previous one is `complete`.
 */
export const ACT_1_QUEST_CHAIN: readonly string[] = ['intro', 'meet_elder', 'cave_artifact', 'cave_boss'];
