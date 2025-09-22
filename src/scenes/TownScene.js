import Phaser from 'phaser';
import { LuminusWarp } from '../plugins/LuminusWarp';
import { LuminusObjectMarker } from '../plugins/LuminusObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { LuminusEnvironmentParticles } from '../plugins/LuminusEnvironmentParticles';
import { LuminusEnemyZones } from '../plugins/LuminusEnemyZones';
import { LuminusMapCreator } from '../plugins/LuminusMapCreator';
import { LuminusSaveManager } from '../plugins/LuminusSaveManager';
import { Item } from '../entities/Item';

export class TownScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'TownScene',
        });
        this.player = null;
    }

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    }

    create() {
        this.cameras.main.setZoom(2.5);

        this.mapCreator = new LuminusMapCreator(this, 'town');
        this.mapCreator.create();

        // Store map reference for other systems
        this.map = this.mapCreator.map;

        const camera = this.cameras.main;
        camera.startFollow(this.player.container);

        const luminusWarp = new LuminusWarp(this, this.player, this.mapCreator.map);
        luminusWarp.createWarps();
        const interactiveMarkers = new LuminusObjectMarker(this, this.mapCreator.map);
        interactiveMarkers.create();

        this.scene.launch('DialogScene', {
            player: this.player,
            map: this.mapCreator.map,
            scene: this,
        });

        this.joystickScene = this.scene.get('JoystickScene');

        this.scene.launch('HUDScene', { player: this.player });

        this.sys.animatedTiles.init(this.mapCreator.map);
        this.particles = new LuminusEnvironmentParticles(this, this.mapCreator.map);
        this.particles.create();

        this.sound.volume = 0.35;
        this.themeSound = this.sound.add('path_to_lake_land', {
            loop: true,
        });
        this.themeSound.play();

        this.enemies = [];

        this.luminusEnemyZones = new LuminusEnemyZones(this, this.mapCreator.map);
        this.luminusEnemyZones.create();

        this.saveManager = new LuminusSaveManager(this);
        this.saveManager.create();
        this.setupSaveKeybinds();
    }

    setupSaveKeybinds() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.saveManager.saveGame(false);
            }
            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                const saveData = this.saveManager.loadGame(false);
                if (saveData) {
                    this.saveManager.applySaveData(saveData);
                }
            }
            if (event.key === 'F5') {
                event.preventDefault();
                const saveData = this.saveManager.loadGame(true);
                if (saveData) {
                    this.saveManager.applySaveData(saveData);
                } else {
                    this.saveManager.showSaveNotification('No checkpoint found', true);
                }
            }
        });
    }

    stopSceneMusic() {
        this.themeSound.stop();
    }

    update(time, delta) {
        // Town-specific update logic can be added here
    }
}