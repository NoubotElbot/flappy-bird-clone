import BaseScene from "./BaseScene";

class PauseScene extends BaseScene {
  constructor(config) {
    super("PauseScene", config);

    this.menu = [
      { scene: "PlayScene", text: "Continue" },
      { scene: "MenuScene", text: "Exit" },
    ];
  }

  create() {
    super.create();
    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO
      .setInteractive()
      .on("pointerover", () => {
        textGO.setColor("#FF0");
      })
      .on("pointerout", () => {
        textGO.setColor("#FFF");
      })
      .on("pointerup", () => {
        if (menuItem.scene && menuItem.text === "Continue") {
          this.scene.stop();
          this.scene.resume("PlayScene");
        } else {
          // Shutting PlayScene, PauseScene and running MenuScene
          this.scene.stop('PlayScene');
          this.scene.start("MenuScene");
        }
      });
  }
}

export default PauseScene;
