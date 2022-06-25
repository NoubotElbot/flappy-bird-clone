import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
    constructor(config) {
        super('MenuScene', config);

        this.menu = [
            { scene: 'PlayScene', text: 'Play' },
            { scene: 'ScoreScene', text: 'Score' },
            { scene: null, text: 'Exit' },
        ]
    }

    create() {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive()
            .on('pointerover', () => {
                textGO.setColor('#FF0');
            })
            .on('pointerout', () => {
                textGO.setColor('#FFF');
            })
            .on('pointerup', () => {
                menuItem.scene && this.scene.start(menuItem.scene);
                if (menuItem.text === 'Exit') {
                    this.game.destroy(true);
                }
            });
    }
}

export default MenuScene;