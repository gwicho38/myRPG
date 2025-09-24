// Paste this in the browser console to debug the dialog system
// Enhanced dialog debugging with comprehensive checks

// Get any scene with dialog capabilities (MainScene, DialogScene, etc)
const getSceneWithDialog = () => {
    const game = window.game || Phaser.GAMES[0];
    if (!game) {
        console.error('No Phaser game found!');
        return null;
    }

    const scenes = game.scene.scenes;
    console.log('🔍 Available scenes:', scenes.map(s => ({
        key: s.sys.config.key,
        active: s.sys.isActive(),
        visible: s.sys.isVisible()
    })));

    // Try to find scene with dialog box
    let targetScene = scenes.find(s => s.luminusDialogBox);

    // If not found directly, check for MainScene or any active scene
    if (!targetScene) {
        targetScene = scenes.find(s => s.sys.config.key === 'MainScene' && s.sys.isActive());
    }

    // Check for any scene with player
    if (!targetScene) {
        targetScene = scenes.find(s => s.player && s.sys.isActive());
    }

    if (!targetScene) {
        console.error('No scene with dialog system found! Active scenes:',
            scenes.filter(s => s.sys.isActive()).map(s => s.sys.config.key));
        return null;
    }

    console.log('✅ Using scene:', targetScene.sys.config.key);
    return targetScene;
};

// Debug function to check dialog components
const debugDialog = () => {
    const scene = getSceneWithDialog();
    if (!scene) return;

    // Try multiple ways to find the dialog box
    let dialogBox = scene.luminusDialogBox;
    if (!dialogBox && scene.luminusTiledInfoBox) {
        dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
    }

    if (!dialogBox) {
        console.error('DialogBox not found on scene!');
        console.log('Scene properties:', Object.keys(scene));
        return;
    }

    console.group('🎮 Dialog System Debug Info');

    // Check dialog box itself
    console.log('Dialog Box:', {
        visible: dialogBox.dialog?.visible,
        x: dialogBox.dialog?.x,
        y: dialogBox.dialog?.y,
        width: dialogBox.dialog?.width,
        height: dialogBox.dialog?.height,
        depth: dialogBox.dialog?.depth,
        alpha: dialogBox.dialog?.alpha
    });

    // Check text message
    const textMsg = dialogBox.dialog?.textMessage;
    console.log('Text Message Object:', {
        exists: !!textMsg,
        visible: textMsg?.visible,
        text: textMsg?.text,
        x: textMsg?.x,
        y: textMsg?.y,
        alpha: textMsg?.alpha,
        depth: textMsg?.depth,
        style: textMsg?.style,
        color: textMsg?.style?.color,
        fontSize: textMsg?.style?.fontSize,
        fontFamily: textMsg?.style?.fontFamily
    });

    // Check name texts
    console.log('Left Name Text:', {
        visible: dialogBox.leftNameText?.visible,
        text: dialogBox.leftNameText?.text,
        x: dialogBox.leftNameText?.x,
        y: dialogBox.leftNameText?.y,
        alpha: dialogBox.leftNameText?.alpha
    });

    console.log('Right Name Text:', {
        visible: dialogBox.rightNameText?.visible,
        text: dialogBox.rightNameText?.text,
        x: dialogBox.rightNameText?.x,
        y: dialogBox.rightNameText?.y
    });

    // Check current chat
    console.log('Current Chat:', {
        message: dialogBox.currentChat?.message,
        leftName: dialogBox.currentChat?.leftName,
        rightName: dialogBox.currentChat?.rightName,
        index: dialogBox.currentChat?.index
    });

    // Check dialog message and pages
    console.log('Dialog Message:', dialogBox.dialogMessage);
    console.log('Pages:', dialogBox.pagesMessage);
    console.log('Current Page:', dialogBox.currentPage, '/', dialogBox.pagesNumber);

    // Check camera dimensions
    console.log('Camera:', {
        width: dialogBox.cameraWidth,
        height: dialogBox.cameraHeight,
        actualWidth: scene.cameras?.main?.width,
        actualHeight: scene.cameras?.main?.height
    });

    // Check margins and sizing
    console.log('Layout:', {
        margin: dialogBox.margin,
        dialogHeight: dialogBox.dialogHeight,
        textWidth: dialogBox.textWidth,
        fontSize: dialogBox.fontSize
    });

    console.groupEnd();

    // Try to make text visible forcefully
    if (textMsg) {
        console.log('🔧 Attempting to force text visibility...');
        textMsg.setVisible(true);
        textMsg.setAlpha(1);
        textMsg.setDepth(999999999);
        textMsg.setStyle({ color: '#FF0000', fontSize: '20px' }); // Red color for testing
        textMsg.setText('TEST MESSAGE - CAN YOU SEE THIS?');
        console.log('Text forced to:', textMsg.text);
        console.log('New position would be:', textMsg.x, textMsg.y);
    }

    return dialogBox;
};

// Function to manually trigger dialog
const showTestDialog = () => {
    const scene = getSceneWithDialog();
    if (!scene) return;

    // Try multiple ways to find the dialog box
    let dialogBox = scene.luminusDialogBox;
    if (!dialogBox && scene.luminusTiledInfoBox) {
        dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
    }

    if (!dialogBox) {
        console.error('DialogBox not found!');
        console.log('Available scene properties:', Object.keys(scene).filter(k => k.includes('dialog') || k.includes('Dialog')));
        return;
    }

    // Force show dialog with test message
    dialogBox.dialog.visible = true;
    dialogBox.leftNameText.visible = true;
    dialogBox.leftNameText.setText('DEBUG TEST:');
    dialogBox.dialogMessage = 'This is a test message to check if the dialog system is working. Can you see this text?';
    dialogBox.showDialog(true);

    console.log('✅ Test dialog triggered');
};

// Function to check text bounds
const checkTextBounds = () => {
    const scene = getSceneWithDialog();
    if (!scene) return;

    let dialogBox = scene.luminusDialogBox;
    if (!dialogBox && scene.luminusTiledInfoBox) {
        dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
    }
    if (!dialogBox) return;

    const textMsg = dialogBox.dialog?.textMessage;
    if (!textMsg) {
        console.error('No text message found');
        return;
    }

    const bounds = textMsg.getBounds();
    const camera = scene.cameras.main;

    console.group('📏 Text Bounds Check');
    console.log('Text Bounds:', bounds);
    console.log('Camera View:', {
        left: camera.scrollX,
        top: camera.scrollY,
        right: camera.scrollX + camera.width,
        bottom: camera.scrollY + camera.height
    });
    console.log('Is in view?', {
        horizontal: bounds.x >= 0 && bounds.x <= camera.width,
        vertical: bounds.y >= 0 && bounds.y <= camera.height
    });
    console.groupEnd();
};

// Advanced dialog testing functions
const forceShowDialog = () => {
    const scene = getSceneWithDialog();
    if (!scene) return;

    let dialogBox = scene.luminusDialogBox;
    if (!dialogBox && scene.luminusTiledInfoBox) {
        dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
    }

    if (!dialogBox) {
        console.error('❌ No dialog box found!');
        return;
    }

    console.log('🔧 Force showing dialog...');

    // Ensure dialog container exists
    if (!dialogBox.dialog) {
        console.error('❌ Dialog container not initialized!');
        return;
    }

    // Make dialog visible
    dialogBox.dialog.visible = true;
    dialogBox.dialog.setAlpha(1);
    dialogBox.dialog.setDepth(999999);

    // Set a test message
    dialogBox.chat = [{
        message: 'DEBUG TEST: This is a test message. If you can see this, the dialog system is working!',
        leftName: 'Debug Tester',
        left: true,
        index: 0
    }];

    // Initialize current chat
    dialogBox.currentChat = dialogBox.chat[0];
    dialogBox.dialogMessage = dialogBox.currentChat.message;

    // Show dialog with text
    dialogBox.showDialog(true);

    // Force text visibility
    if (dialogBox.dialog.textMessage) {
        dialogBox.dialog.textMessage.setVisible(true);
        dialogBox.dialog.textMessage.setAlpha(1);
        dialogBox.dialog.textMessage.setDepth(99999999999);
        dialogBox.dialog.textMessage.setText('TEST: Can you see this?');
        dialogBox.dialog.textMessage.setStyle({ color: '#FFFF00', fontSize: '24px' });
    }

    console.log('✅ Dialog forced to show');
    console.log('Dialog state:', {
        dialogVisible: dialogBox.dialog.visible,
        textExists: !!dialogBox.dialog.textMessage,
        textVisible: dialogBox.dialog.textMessage?.visible,
        text: dialogBox.dialog.textMessage?.text
    });
};

// Function to simulate player interaction with NPC
const simulateNPCInteraction = () => {
    const scene = getSceneWithDialog();
    if (!scene) return;

    let dialogBox = scene.luminusDialogBox;
    if (!dialogBox && scene.luminusTiledInfoBox) {
        dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
    }

    if (!dialogBox) {
        console.error('❌ No dialog box found!');
        return;
    }

    console.log('🎭 Simulating NPC interaction...');

    // Set up test chat data
    dialogBox.chat = [
        {
            message: 'Hello there! Welcome to the debug test.',
            leftName: 'NPC',
            left: true,
            index: 0
        },
        {
            message: 'This is the second message in the dialog sequence.',
            leftName: 'NPC',
            left: true,
            index: 1
        },
        {
            message: 'And this is the final message. Press J to continue.',
            rightName: 'Player',
            right: true,
            index: 2
        }
    ];

    // Simulate overlap
    dialogBox.isOverlapingChat = true;
    dialogBox.showRandomChat = false;

    // Trigger dialog
    dialogBox.checkButtonDown();

    console.log('✅ NPC interaction simulated');
};

// Monitor dialog state in real-time
let monitorInterval = null;
const startMonitoring = () => {
    if (monitorInterval) {
        console.log('⏸️ Monitoring already running');
        return;
    }

    console.log('▶️ Starting dialog monitoring...');
    monitorInterval = setInterval(() => {
        const scene = getSceneWithDialog();
        if (!scene) return;

        let dialogBox = scene.luminusDialogBox;
        if (!dialogBox && scene.luminusTiledInfoBox) {
            dialogBox = scene.luminusTiledInfoBox.luminusDialogBox;
        }

        if (!dialogBox) return;

        if (dialogBox.dialog?.visible || dialogBox.isOverlapingChat) {
            console.log('📊 Dialog State:', {
                dialogVisible: dialogBox.dialog?.visible,
                overlapping: dialogBox.isOverlapingChat,
                showRandomChat: dialogBox.showRandomChat,
                canShow: dialogBox.canShowDialog,
                animating: dialogBox.isAnimatingText,
                currentPage: dialogBox.currentPage,
                textContent: dialogBox.dialog?.textMessage?.text?.substring(0, 50) + '...'
            });
        }
    }, 1000);
};

const stopMonitoring = () => {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        console.log('⏹️ Monitoring stopped');
    }
};

// Check all dialog-related objects in the scene
const findAllDialogObjects = () => {
    const game = window.game || Phaser.GAMES[0];
    if (!game) return;

    const scenes = game.scene.scenes;
    console.group('🔎 Searching for dialog objects in all scenes');

    scenes.forEach(scene => {
        if (!scene.sys.isActive()) return;

        console.group(`Scene: ${scene.sys.config.key}`);

        // Check for dialog-related properties
        const dialogProps = Object.keys(scene).filter(key =>
            key.toLowerCase().includes('dialog') ||
            key.toLowerCase().includes('chat') ||
            key.toLowerCase().includes('luminus')
        );

        if (dialogProps.length > 0) {
            console.log('Dialog-related properties:', dialogProps);
            dialogProps.forEach(prop => {
                console.log(`  ${prop}:`, scene[prop]);
            });
        }

        // Check for display objects with dialog in name
        if (scene.children) {
            const dialogChildren = scene.children.list.filter(child =>
                child.name && (child.name.includes('dialog') || child.name.includes('chat'))
            );
            if (dialogChildren.length > 0) {
                console.log('Dialog children:', dialogChildren);
            }
        }

        console.groupEnd();
    });

    console.groupEnd();
};

// Run the debug
console.log('🎮 Enhanced Dialog Debug System Loaded!');
console.log('\n📋 Available commands:');
console.log('  debugDialog()          - Check all dialog components');
console.log('  showTestDialog()       - Force show a test dialog');
console.log('  forceShowDialog()      - Force dialog visibility with test message');
console.log('  simulateNPCInteraction() - Simulate a full NPC conversation');
console.log('  checkTextBounds()      - Check if text is within camera bounds');
console.log('  findAllDialogObjects() - Search all scenes for dialog objects');
console.log('  startMonitoring()      - Start real-time dialog monitoring');
console.log('  stopMonitoring()       - Stop monitoring');
console.log('\n🔍 Running initial scan...');
findAllDialogObjects();
console.log('\n💡 TIP: Press J key or click the action button to interact with dialogs');
console.log('💡 TIP: Run startMonitoring() to track dialog state in real-time');