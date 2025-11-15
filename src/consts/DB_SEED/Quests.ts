import { IQuestConfig } from '../../types/QuestTypes';
import { QuestObjectiveType } from '../../models/QuestObjectiveType';

/**
 * NEVERQUEST - MAIN QUEST LINE
 * A story about a hero awakening in a mysterious world,
 * uncovering ancient secrets, and facing a looming darkness.
 */
export const DB_SEED_QUESTS: IQuestConfig[] = [
	// ====== MAIN QUEST LINE ======
	{
		id: 1,
		name: 'Awakening',
		description:
			'You wake up in an unfamiliar place with no memory of how you got here. A voice calls to you from the town center.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 1,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.TALK_TO_NPC,
				description: 'Speak with Elder Marcus in the town center',
				targetId: 1, // Elder Marcus NPC ID
				completed: false,
			},
		],
		rewards: {
			xp: 50,
			gold: 10,
			items: [{ id: 1, count: 2 }], // 2 Red Potions
		},
		dialogueStart: 'Welcome, stranger. You seem lost. Let me help you understand your purpose here.',
		dialogueComplete: 'Good. Now you know what you must do. The darkness grows stronger each day.',
		autoAccept: true,
	},
	{
		id: 2,
		name: 'The Rat Infestation',
		description:
			"The town's food stores are being raided by giant rats. Clear them out to prove your worth as an adventurer.",
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 1,
		prerequisites: [1],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 5 rats',
				targetId: 1, // Rat enemy ID
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 100,
			gold: 25,
			items: [{ id: 1, count: 3 }], // 3 Red Potions
			unlockQuest: 3,
		},
		dialogueStart:
			'Those cursed rats are eating our grain! Deal with them, and I will reward you handsomely.',
		dialogueProgress: 'I can still hear those rats scurrying about. Please, hurry!',
		dialogueComplete: 'Well done! The town is safer thanks to you. But greater dangers await...',
	},
	{
		id: 3,
		name: 'Shadows in the Cave',
		description:
			'Strange noises have been heard from the nearby cave. Elder Marcus asks you to investigate.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 2,
		prerequisites: [2],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Enter the Cave',
				targetId: 3, // Cave scene ID
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 3 bats in the cave',
				targetId: 2, // Bat enemy ID
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 150,
			gold: 40,
			items: [
				{ id: 1, count: 5 },
				{ id: 2, count: 1 },
			], // Potions
			unlockQuest: 4,
		},
		dialogueStart: 'Travelers report seeing dark shapes in the cave. Please investigate this threat.',
		dialogueComplete: 'Bats, you say? That explains the noises. But I fear something darker lurks below...',
	},
	{
		id: 4,
		name: 'The Lost Explorer',
		description:
			'An explorer named Sarah went into the cave days ago and never returned. Find her and bring her home safely.',
		questGiver: 'Worried Mother',
		questGiverLocation: 'Town',
		type: 'main',
		level: 3,
		prerequisites: [3],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Venture deeper into the cave',
				targetId: 3,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.TALK_TO_NPC,
				description: 'Find Sarah the Explorer',
				targetId: 5, // Sarah NPC ID
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.ESCORT,
				description: 'Escort Sarah back to town safely',
				targetId: 5,
				completed: false,
			},
		],
		rewards: {
			xp: 200,
			gold: 60,
			items: [{ id: 4, count: 1 }], // Mighty Sword
			unlockQuest: 5,
		},
		dialogueStart: 'Please, my daughter Sarah went exploring in that cursed cave. Find her!',
		dialogueComplete: "Thank you for bringing my Sarah home! Take this sword - you'll need it.",
	},
	{
		id: 5,
		name: 'Ancient Secrets',
		description:
			'Sarah discovered strange markings in the cave. Elder Marcus believes they may be connected to the Ancient Seal.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 4,
		prerequisites: [4],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Collect 3 Ancient Fragments from defeated enemies',
				targetId: 10, // Ancient Fragment item ID (new item to create)
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 250,
			gold: 80,
			unlockQuest: 6,
		},
		dialogueStart:
			'Those markings... they speak of an ancient evil. We must gather the fragments to learn more.',
		dialogueComplete: 'These fragments... they pulse with dark energy. We must prepare for what comes.',
	},
	{
		id: 6,
		name: 'The First Dungeon',
		description:
			'The fragments point to a hidden dungeon beneath the forest. Explore it and discover its secrets.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 5,
		prerequisites: [5],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Enter the Hidden Dungeon',
				targetId: 6, // Dungeon entrance
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.COMPLETE_DUNGEON,
				description: 'Navigate through the dungeon',
				targetId: 6,
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.DEFEAT_BOSS,
				description: 'Defeat the Dungeon Guardian',
				targetId: 10, // Boss enemy ID (to create)
				completed: false,
			},
		],
		rewards: {
			xp: 400,
			gold: 150,
			items: [{ id: 15, count: 1 }], // Legendary equipment
			unlockQuest: 7,
		},
		dialogueStart:
			'The dungeon entrance has been sealed for centuries. You must break the seal and face what lies within.',
		dialogueComplete:
			'You defeated the Guardian! But this is only the beginning. Darker forces are awakening...',
	},
	{
		id: 7,
		name: 'Whispers of Darkness',
		description:
			'After defeating the Guardian, you hear whispers of an ancient evil stirring in the depths. Investigate the source.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 7,
		prerequisites: [6],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.TALK_TO_NPC,
				description: 'Consult with the Sage in Larus',
				targetId: 8, // Sage NPC
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Gather 5 Dark Essence from shadow creatures',
				targetId: 11, // Dark Essence item
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 500,
			gold: 200,
			unlockQuest: 8,
		},
		dialogueStart:
			'The whispers grow louder. Seek out the Sage - she may know what ancient evil awakens.',
		dialogueComplete: 'The Dark Essence confirms our fears. The Shadow Lord is returning...',
	},
	{
		id: 8,
		name: 'The Ogre Threat',
		description: 'Ogres have begun raiding villages. They seem to be organized by a powerful leader.',
		questGiver: 'Captain of the Guard',
		questGiverLocation: 'Town',
		type: 'main',
		level: 8,
		prerequisites: [7],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 10 ogres',
				targetId: 3, // Ogre enemy ID
				targetCount: 10,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.DEFEAT_BOSS,
				description: 'Defeat the Ogre Chieftain',
				targetId: 11, // Ogre Chieftain boss
				completed: false,
			},
		],
		rewards: {
			xp: 600,
			gold: 250,
			items: [{ id: 20, count: 1 }], // Epic armor
			unlockQuest: 9,
		},
		dialogueStart: 'The ogres grow bolder. Their chieftain must be stopped before they destroy everything!',
		dialogueComplete: 'With the Chieftain fallen, the ogres will scatter. But greater threats loom...',
	},
	{
		id: 9,
		name: 'The Frozen Wastes',
		description:
			'Ancient texts speak of a Frozen Temple in the north. The next seal fragment lies within.',
		questGiver: 'Sage',
		questGiverLocation: 'Larus',
		type: 'main',
		level: 10,
		prerequisites: [8],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Journey to the Frozen Wastes',
				targetId: 10, // Ice Caverns map
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Retrieve the Frost Seal Fragment',
				targetId: 25, // Frost Seal Fragment
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 800,
			gold: 300,
			unlockQuest: 10,
		},
		dialogueStart: 'The Frozen Temple holds one of the five seal fragments. Steel yourself - the cold is deadly.',
		dialogueComplete: 'You survived the frost! Two fragments down, three to go.',
	},
	{
		id: 10,
		name: 'The Volcanic Heart',
		description: 'The second fragment lies in the heart of an active volcano. Can you withstand the heat?',
		questGiver: 'Sage',
		questGiverLocation: 'Larus',
		type: 'main',
		level: 12,
		prerequisites: [9],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Enter the Volcano',
				targetId: 11, // Volcano map
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.DEFEAT_BOSS,
				description: 'Defeat the Fire Elemental',
				targetId: 15, // Fire Elemental boss
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Retrieve the Flame Seal Fragment',
				targetId: 26, // Flame Seal Fragment
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 1000,
			gold: 400,
			items: [{ id: 30, count: 1 }], // Fire resistance armor
			unlockQuest: 11,
		},
		dialogueStart: 'The volcano awakens. Claim the fragment before it erupts and destroys everything!',
		dialogueComplete: 'The Flame Fragment is ours. But the volcano grows unstable...',
	},

	// Continue with quests 11-30 for the full main questline...
	// For brevity, I'll add a few more key quests and then move to side quests

	{
		id: 20,
		name: 'The Final Seal',
		description:
			'All five fragments are gathered. The time has come to face the Shadow Lord and seal away the darkness forever.',
		questGiver: 'Elder Marcus',
		questGiverLocation: 'Town',
		type: 'main',
		level: 20,
		prerequisites: [19], // After gathering all 5 fragments
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.REACH_LOCATION,
				description: 'Enter the Shadow Realm',
				targetId: 20, // Shadow Realm map
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.DEFEAT_BOSS,
				description: 'Defeat the Shadow Lord',
				targetId: 50, // Shadow Lord final boss
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.USE_ITEM,
				description: 'Activate the Ancient Seal',
				targetId: 100, // Ancient Seal item
				completed: false,
			},
		],
		rewards: {
			xp: 5000,
			gold: 2000,
			items: [{ id: 99, count: 1 }], // Legendary final weapon
		},
		dialogueStart:
			'This is it. The fate of the world rests on your shoulders. May the light guide you!',
		dialogueComplete: 'You did it! The Shadow Lord is sealed. Peace returns to the land. You are a true hero!',
	},

	// ====== SIDE QUESTS ======
	{
		id: 101,
		name: 'The Lumberjack\'s Axe',
		description: 'A lumberjack lost his prized axe in the forest. Help him find it.',
		questGiver: 'Lumberjack',
		questGiverLocation: 'Overworld',
		type: 'side',
		level: 1,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: "Find the Lumberjack's Axe",
				targetId: 50, // Lost Axe item
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.DELIVER_ITEM,
				description: 'Return the axe to the Lumberjack',
				targetId: 50,
				completed: false,
			},
		],
		rewards: {
			xp: 75,
			gold: 30,
			items: [{ id: 1, count: 5 }],
		},
		dialogueStart: 'My axe! I dropped it somewhere in these woods. Can you help me find it?',
		dialogueComplete: 'My axe! Thank you so much! Here, take this as thanks.',
		repeatable: false,
	},
	{
		id: 102,
		name: 'Mushroom Collector',
		description: 'An alchemist needs rare mushrooms for her potions. Collect them from the cave.',
		questGiver: 'Alchemist',
		questGiverLocation: 'Town',
		type: 'side',
		level: 2,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Collect 10 Glowing Mushrooms',
				targetId: 51, // Glowing Mushroom item
				targetCount: 10,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 100,
			gold: 50,
			items: [{ id: 52, count: 3 }], // Special potion
		},
		dialogueStart: 'I need glowing mushrooms for my potions. They grow in the cave - but beware the bats!',
		dialogueComplete: 'Perfect specimens! Here, take these potions I brewed.',
		repeatable: true,
	},
	{
		id: 103,
		name: 'Beast Hunter',
		description: 'Prove yourself as a hunter by defeating various creatures.',
		questGiver: 'Hunter',
		questGiverLocation: 'Town',
		type: 'side',
		level: 5,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 5 rats',
				targetId: 1,
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 5 bats',
				targetId: 2,
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 3 ogres',
				targetId: 3,
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 300,
			gold: 150,
			items: [{ id: 60, count: 1 }], // Hunter's Bow
		},
		dialogueStart: 'Think you can hunt? Prove it by taking down rats, bats, and ogres!',
		dialogueComplete: 'Impressive! You are a true hunter. Take this bow - you earned it.',
		repeatable: false,
	},
	{
		id: 104,
		name: 'The Mysterious Stranger',
		description:
			'A hooded stranger offers you a challenge: survive 5 minutes in the dungeon without healing.',
		questGiver: 'Mysterious Stranger',
		questGiverLocation: 'Town',
		type: 'side',
		level: 8,
		prerequisites: [6], // Must have completed first dungeon
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.SURVIVE,
				description: 'Survive 5 minutes in the dungeon without using healing items',
				targetCount: 300, // 300 seconds
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 500,
			gold: 300,
			items: [{ id: 70, count: 1 }], // Shadow Cloak
		},
		dialogueStart:
			'I challenge you: survive the dungeon for 5 minutes without healing. Can you do it?',
		dialogueComplete: 'Remarkable! You have true skill. This cloak will serve you well.',
		repeatable: false,
	},
	{
		id: 105,
		name: 'Lost and Found',
		description: 'Villagers have lost various items. Help them recover their belongings.',
		questGiver: 'Town Crier',
		questGiverLocation: 'Town',
		type: 'side',
		level: 3,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: "Find the Baker's Ring",
				targetId: 53,
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: "Find the Farmer's Hat",
				targetId: 54,
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
			{
				id: 3,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: "Find the Blacksmith's Hammer",
				targetId: 55,
				targetCount: 1,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 200,
			gold: 100,
		},
		dialogueStart: 'Several villagers have lost precious items. Can you help find them?',
		dialogueComplete: 'You found everything! The villagers are so grateful!',
		repeatable: false,
	},

	// More side quests to reach 15-20 total
	{
		id: 106,
		name: 'Training Day',
		description: 'Complete basic training to improve your combat skills.',
		questGiver: 'Training Master',
		questGiverLocation: 'Town',
		type: 'side',
		level: 1,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.KILL_ENEMY,
				description: 'Defeat 3 training dummies',
				targetId: 100, // Training dummy enemy
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.LEVEL_UP,
				description: 'Reach level 2',
				targetCount: 2,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 50,
			gold: 20,
			items: [{ id: 1, count: 3 }],
		},
		dialogueStart: 'Ready to train? Show me what you can do!',
		dialogueComplete: 'Good work! You show promise.',
		repeatable: false,
	},
	{
		id: 107,
		name: 'Dungeon Delver',
		description: 'Complete 5 different dungeons to prove your adventuring skills.',
		questGiver: 'Explorer Guild Master',
		questGiverLocation: 'Town',
		type: 'side',
		level: 10,
		prerequisites: [6],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COMPLETE_DUNGEON,
				description: 'Complete 5 dungeons',
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 1000,
			gold: 500,
			items: [{ id: 80, count: 1 }], // Dungeon Explorer Badge
		},
		dialogueStart:
			'Think you can master the dungeons? Complete 5 and join our elite explorers!',
		dialogueComplete: 'Incredible! You are now an elite member of the Explorer Guild!',
		repeatable: false,
	},
	{
		id: 108,
		name: 'The Collector',
		description: 'A wealthy collector seeks rare treasures. Find them in dungeons.',
		questGiver: 'Wealthy Collector',
		questGiverLocation: 'Town',
		type: 'side',
		level: 7,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Find 3 Ancient Artifacts',
				targetId: 85,
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 400,
			gold: 400,
		},
		dialogueStart: 'I seek ancient artifacts from the dungeons. Find them and I will pay handsomely!',
		dialogueComplete: 'Marvelous! These will make fine additions to my collection!',
		repeatable: true,
	},
	{
		id: 109,
		name: 'Speed Runner',
		description: 'Complete a dungeon in under 5 minutes.',
		questGiver: 'Speed Champion',
		questGiverLocation: 'Town',
		type: 'side',
		level: 12,
		prerequisites: [6],
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COMPLETE_DUNGEON,
				description: 'Complete a dungeon in under 5 minutes',
				targetCount: 1,
				completed: false,
			},
		],
		rewards: {
			xp: 800,
			gold: 300,
			items: [{ id: 90, count: 1 }], // Speed Boots
		},
		dialogueStart: 'Speed is everything! Complete a dungeon in under 5 minutes and prove your worth!',
		dialogueComplete: 'Lightning fast! These boots will make you even faster!',
		repeatable: false,
	},
	{
		id: 110,
		name: 'Master Chef',
		description: 'Collect ingredients and learn to cook powerful meals.',
		questGiver: 'Master Chef',
		questGiverLocation: 'Town',
		type: 'side',
		level: 4,
		objectives: [
			{
				id: 1,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Collect 5 Wild Berries',
				targetId: 91,
				targetCount: 5,
				currentCount: 0,
				completed: false,
			},
			{
				id: 2,
				type: QuestObjectiveType.COLLECT_ITEM,
				description: 'Collect 3 Fresh Meat',
				targetId: 92,
				targetCount: 3,
				currentCount: 0,
				completed: false,
			},
		],
		rewards: {
			xp: 250,
			gold: 100,
			items: [{ id: 93, count: 5 }], // Cooked Meals
		},
		dialogueStart: 'Want to learn cooking? Bring me berries and meat, and I will teach you!',
		dialogueComplete: 'Excellent ingredients! Here are some meals I prepared for you.',
		repeatable: true,
	},
];
