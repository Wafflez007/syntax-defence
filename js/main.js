const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [BootScene, AttractMode, GameScene, ResultScene]
};

const game = new Phaser.Game(config);