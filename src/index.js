import Phaser, { Scene } from 'phaser'
import MenuScene from './scenes/MenuScene'
import PauseScene from './scenes/PauseScene'
import PlayScene from './scenes/PlayScene'
import PreloadScene from './scenes/PreloadScene'
import ScoreScene from './scenes/ScoreScene'

const WIDHT = 400
const HEIGHT = 600
const BIRD_POSITION = {
  x: WIDHT * 0.1,
  y: HEIGHT / 2,
}
const SHARED_CONFIG = {
  width: WIDHT,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
}

const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene]

const createScene = (Scene) => new Scene(SHARED_CONFIG)

const initScene = () => Scenes.map(createScene)

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      //   debug: true,
    },
  },
  parent: 'game',
  scene: initScene(),
}

const game = new Phaser.Game(config)
