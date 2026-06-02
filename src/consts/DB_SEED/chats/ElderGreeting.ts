/**
 * @fileoverview Village Elder greeting dialog (Chapter 1 quest-giver)
 *
 * The Elder sets the player on the Chapter 1 path:
 * - Names the threat (the stolen artifact / cave guardian)
 * - Asks Lucius to descend into the nearby cave
 *
 * Meeting the Elder sets the MET_ELDER story flag, completing the
 * "The Elder's Request" quest and activating "The Stolen Artifact".
 *
 * @see NeverquestNPCManager - Spawns the Elder in MainScene
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/ElderGreeting
 */

export default {
	id: 15,
	chat: [
		{
			leftPortraitName: '',
			leftName: 'Village Elder',
			left: true,
			message:
				'Lucius! You are awake at last. Dark days have come upon us — a relic was stolen from our shrine and dragged into the cave to the east.',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Village Elder',
			left: true,
			message:
				'A guardian now broods over it in the dark. None who entered have returned. You alone may have the strength to face it.',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Village Elder',
			left: false,
			message: 'Then I will go to the cave, recover the artifact, and put down whatever guards it.',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Village Elder',
			left: true,
			leftExit: false,
			message:
				'Go with our hopes, Lucius. The cave lies east of the village — step into the dark portal to descend. Return to me when the artifact is safe.',
			rightPortraitName: '',
			rightName: '',
			right: false,
			rightExit: false,
		},
	],
};
