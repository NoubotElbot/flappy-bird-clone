import BaseScene from './BaseScene'

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config)
    this.bird = null
    this.pipes = null
    this.isPaused = false

    this.PIPE_VERTICAL_DISTANCE_RANGE = [150, 250]
    this.PIPE_HORIZONTAL_DISTANCE_RANGE = [500, 550]
    this.FLAP_VELOCITY = 300
    this.PIPES_TO_RENDER = 4

    this.BIRD_GRAVITY = 600

    this.score = 0
    this.score_text = ''

    this.currentDifficulty = 'easy'
    this.difficulties = {
      easy: {
        PIPE_HORIZONTAL_DISTANCE_RANGE: [300, 350],
        PIPE_VERTICAL_DISTANCE_RANGE: [150, 200],
      },
      normal: {
        PIPE_HORIZONTAL_DISTANCE_RANGE: [280, 330],
        PIPE_VERTICAL_DISTANCE_RANGE: [140, 190],
      },
      hard: {
        PIPE_HORIZONTAL_DISTANCE_RANGE: [250, 310],
        PIPE_VERTICAL_DISTANCE_RANGE: [120, 150],
      },
    }
  }

  create() {
    super.create()
    this.createBird()
    this.createPipes()
    this.createColliders()
    this.createScore()
    this.createPause()
    this.handleInputs()
    this.listenToEvents()

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', {
        start: 8,
        end: 15,
      }),
      frameRate: 4,
      repeat: -1,
    })

    this.bird.play('fly')
  }

  update() {
    this.checkGameStatus()
    this.recyclePipes()
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return
    }
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTiem = 3
      this.countDownText = this.add
        .text(...this.screenCenter, 'Fly in ' + this.initialTiem, this.fontOptions)
        .setOrigin(0.5)
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      })
    })
  }

  countDown() {
    this.initialTiem--
    this.countDownText.setText('Fly in ' + this.initialTiem)
    if (this.initialTiem <= 0) {
      this.isPaused = false
      this.countDownText.setText('')
      this.physics.resume()
      this.timedEvent.remove()
    }
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setFlipX(true)
      .setScale(3)
      .setOrigin(0)

    this.bird.setBodySize(this.bird.width, this.bird.height-8)
    this.bird.body.gravity.y = this.BIRD_GRAVITY
    this.bird.setCollideWorldBounds(true)
  }

  createPipes() {
    this.pipes = this.physics.add.group()
    for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 1)
      const lowerPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 0)

      this.placePipes(upperPipe, lowerPipe)
    }
    this.pipes.setVelocityX(-200)
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this)
  }

  createScore() {
    this.score = 0
    const bestScore = localStorage.getItem('bestScore')
    this.score_text = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: '32px',
      fill: '#000',
    })
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, {
      fontSize: '18px',
      fill: '#000',
    })
  }

  createPause() {
    this.isPaused = false
    const pause_botton = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1)
    pause_botton.on(
      'pointerdown',
      () => {
        this.isPaused = true
        this.physics.pause()
        this.scene.pause()
        this.scene.launch('PauseScene')
      },
      this
    )
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this)
    this.input.keyboard.on('keydown_SPACE', this.flap, this)
  }

  checkGameStatus() {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver()
    }
  }

  placePipes(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty]
    const rightMostX = this.getRightMostPipe()

    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.PIPE_VERTICAL_DISTANCE_RANGE)
    const pipeVerticalPocition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance)
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.PIPE_HORIZONTAL_DISTANCE_RANGE)

    uPipe.x = rightMostX + pipeHorizontalDistance
    uPipe.y = pipeVerticalPocition

    lPipe.x = uPipe.x
    lPipe.y = uPipe.y + pipeVerticalDistance
  }

  recyclePipes() {
    const tempPipes = []
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right < 0) {
        tempPipes.push(pipe)
        if (tempPipes.length === 2) {
          this.placePipes(...tempPipes)
          this.inscreaseScore()
          this.saveBestScore()
          this.increaseDifficulty()
        }
      }
    })
  }

  increaseDifficulty() {
    if (this.score === 10) {
      this.currentDifficulty = 'normal'
    }

    if (this.score === 30) {
      this.currentDifficulty = 'hard'
    }
  }

  getRightMostPipe() {
    let rightMostX = 0
    this.pipes.getChildren().forEach((pipe) => {
      rightMostX = Math.max(pipe.x, rightMostX)
    })
    return rightMostX
  }

  flap() {
    if (this.isPaused) {
      return
    }
    this.bird.setVelocityY(-this.FLAP_VELOCITY)
  }

  inscreaseScore() {
    this.score++
    this.score_text.setText(`Score: ${this.score}`)
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore')
    const bestScore = bestScoreText && parseInt(bestScoreText, 10)

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score)
    }
  }

  gameOver() {
    this.physics.pause()
    this.bird.setTint(0xff0000)

    this.saveBestScore()

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart()
      },
      loop: false,
    })
  }
}

export default PlayScene
