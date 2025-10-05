import BadChair from '../../../../consts/DB_SEED/chats/BadChair';
import BedRest from '../../../../consts/DB_SEED/chats/BedRest';
import DungeonEntrance from '../../../../consts/DB_SEED/chats/DungeonEntrance';
import HousePlates from '../../../../consts/DB_SEED/chats/HousePlates';
import IntroductionChat from '../../../../consts/DB_SEED/chats/IntroductionChat';
import LakeView from '../../../../consts/DB_SEED/chats/LakeView';
import LogsInfo from '../../../../consts/DB_SEED/chats/LogsInfo';
import LumberjackHouse from '../../../../consts/DB_SEED/chats/LumberjackHouse';
import RoomBooksInfo from '../../../../consts/DB_SEED/chats/RoomBooksInfo';

describe('Chat Configurations', () => {
	const allChats = [
		{ name: 'BadChair', config: BadChair },
		{ name: 'BedRest', config: BedRest },
		{ name: 'DungeonEntrance', config: DungeonEntrance },
		{ name: 'HousePlates', config: HousePlates },
		{ name: 'IntroductionChat', config: IntroductionChat },
		{ name: 'LakeView', config: LakeView },
		{ name: 'LogsInfo', config: LogsInfo },
		{ name: 'LumberjackHouse', config: LumberjackHouse },
		{ name: 'RoomBooksInfo', config: RoomBooksInfo },
	];

	describe('Chat structure validation', () => {
		allChats.forEach(({ name, config }) => {
			it(`${name} should have valid structure`, () => {
				expect(config).toHaveProperty('id');
				expect(config).toHaveProperty('chat');
				expect(typeof config.id).toBe('number');
				expect(Array.isArray(config.chat)).toBe(true);
				expect(config.chat.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Chat message validation', () => {
		allChats.forEach(({ name, config }) => {
			it(`${name} messages should have required properties`, () => {
				config.chat.forEach((message: any) => {
					expect(message).toHaveProperty('message');
					expect(message).toHaveProperty('left');
					expect(message).toHaveProperty('right');
					expect(typeof message.message).toBe('string');
					expect(typeof message.left).toBe('boolean');
					expect(typeof message.right).toBe('boolean');
				});
			});
		});
	});

	describe('Individual chat configurations', () => {
		it('BadChair should have correct id and content', () => {
			expect(BadChair.id).toBe(6);
			expect(BadChair.chat[0].leftName).toBe('Lucius');
			expect(BadChair.chat[0].message).toContain('weak chair');
		});

		it('BedRest should be defined', () => {
			expect(BedRest).toBeDefined();
			expect(BedRest.chat.length).toBeGreaterThan(0);
		});

		it('DungeonEntrance should be defined', () => {
			expect(DungeonEntrance).toBeDefined();
			expect(DungeonEntrance.chat.length).toBeGreaterThan(0);
		});

		it('HousePlates should be defined', () => {
			expect(HousePlates).toBeDefined();
			expect(HousePlates.chat.length).toBeGreaterThan(0);
		});

		it('IntroductionChat should be defined', () => {
			expect(IntroductionChat).toBeDefined();
			expect(IntroductionChat.chat.length).toBeGreaterThan(0);
		});

		it('LakeView should be defined', () => {
			expect(LakeView).toBeDefined();
			expect(LakeView.chat.length).toBeGreaterThan(0);
		});

		it('LogsInfo should be defined', () => {
			expect(LogsInfo).toBeDefined();
			expect(LogsInfo.chat.length).toBeGreaterThan(0);
		});

		it('LumberjackHouse should be defined', () => {
			expect(LumberjackHouse).toBeDefined();
			expect(LumberjackHouse.chat.length).toBeGreaterThan(0);
		});

		it('RoomBooksInfo should be defined', () => {
			expect(RoomBooksInfo).toBeDefined();
			expect(RoomBooksInfo.chat.length).toBeGreaterThan(0);
		});
	});

	describe('Chat IDs are unique', () => {
		it('should have unique chat IDs', () => {
			const ids = allChats.map((chat) => chat.config.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});
	});
});
