import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.neverquestgames.rpg',
	appName: 'NeverQuest RPG',
	webDir: 'dist', // Changed to match webpack output
	server: {
		androidScheme: 'https',
	},
	plugins: {
		SplashScreen: {
			launchShowDuration: 3000,
			launchAutoHide: true,
			launchFadeOutDuration: 300,
			backgroundColor: '#000000',
			androidSplashResourceName: 'splash',
			androidScaleType: 'CENTER_CROP',
			showSpinner: true,
			androidSpinnerStyle: 'large',
			iosSpinnerStyle: 'small',
			spinnerColor: '#999999',
			splashFullScreen: true,
			splashImmersive: true,
			layoutName: 'launch_screen',
			useDialog: true,
		},
	},
};

export default config;
