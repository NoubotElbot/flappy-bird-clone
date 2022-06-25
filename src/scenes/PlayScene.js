import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);
        this.bird = null;
        this.pipes = null;

        this.PIPE_VERTICAL_DISTANCE_RANGE = [150, 250];
        this.PIPE_HORIZONTAL_DISTANCE_RANGE = [500, 550];
        this.FLAP_VELOCITY = 250;
        this.PIPES_TO_RENDER = 4;

        this.score = 0;
        this.score_text = '';
    }

    create() {
        super.create();
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    createBird() {
        this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0);
        this.bird.body.gravity.y = 400;
    }

    createPipes() {
        this.pipes = this.physics.add.group();
        for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
            const upperPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable(true)
                .setOrigin(0, 1);
            const lowerPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable(true)
                .setOrigin(0, 0);

            this.placePipes(upperPipe, lowerPipe);
        }
        this.pipes.setVelocityX(-200);
    }

    createColliders() {
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    }

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.score_text = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000' });
        this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '32px', fill: '#000' });
    }

    createPause() {
        const pause_botton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
            .setInteractive()
            .setScale(3)
            .setOrigin(1);
        pause_botton.on('pointerdown', () => {
            this.physics.pause();
            this.scene.pause();
            // this.scene.launch('PauseScene');
        }, this);
    }

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown_SPACE', this.flap, this);

    }

    checkGameStatus() {
        if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
            this.gameOver();
        }
    }

    placePipes(uPipe, lPipe) {
        const rightMostX = this.getRightMostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(...this.PIPE_VERTICAL_DISTANCE_RANGE);
        const pipeVerticalPocition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance);
        const pipeHorizontalDistance = Phaser.Math.Between(...this.PIPE_HORIZONTAL_DISTANCE_RANGE);

        uPipe.x = rightMostX + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPocition;

        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;
    }

    recyclePipes() {
        const tempPipes = []
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right < 0) {
                tempPipes.push(pipe);
                if (tempPipes.length === 2) {
                    this.placePipes(...tempPipes);
                    this.inscreaseScore();
                    this.saveBestScore();
                }
            }
        });
    }

    getRightMostPipe() {
        let rightMostX = 0;
        this.pipes.getChildren().forEach(pipe => {
            rightMostX = Math.max(pipe.x, rightMostX);
        });
        return rightMostX;
    }

    flap() {
        this.bird.setVelocityY(-this.FLAP_VELOCITY);
    }

    inscreaseScore() {
        this.score++;
        this.score_text.setText(`Score: ${this.score}`);
    }

    saveBestScore() {
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    }

    gameOver() {
        this.physics.pause();
        this.bird.setTint(0xff0000);

        this.saveBestScore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false
        })
    }
}

export default PlayScene;