import Phaser from 'phaser';
import { Player } from '../../entities/Player';

export class SceneToggleWatcher {
	static toggleScene(sceneContext: Phaser.Scene, name: string, player: Player): void {
		if (!sceneContext.scene.isVisible(name)) {
			sceneContext.scene.launch(name, {
				player: player,
			});
			player.canMove = false;
		} else {
			sceneContext.scene.get(name).scene.stop();
			player.canMove = true;
			player.canAtack = true;
		}
	}
}
