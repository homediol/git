const installStateEventName = 'pavona:pwa-install-state';

let deferredInstallPrompt = null;
let bootstrapped = false;
let serviceWorkerRegistrationPromise = null;
let installState = {
    available: false,
    availableAt: null,
    installed: false,
    supported: false,
};

function detectStandaloneMode() {
    if (typeof window === 'undefined') {
        return false;
    }

    return Boolean(
        window.matchMedia?.('(display-mode: standalone)').matches
        || window.navigator.standalone === true,
    );
}

function emitInstallState() {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(installStateEventName, {
        detail: { ...installState },
    }));
}

function setInstallState(nextState) {
    installState = {
        ...installState,
        ...nextState,
    };

    emitInstallState();
}

export function getPwaInstallState() {
    if (typeof window !== 'undefined') {
        installState = {
            ...installState,
            installed: detectStandaloneMode(),
            supported: window.isSecureContext && 'serviceWorker' in navigator,
        };
    }

    return { ...installState };
}

export function subscribeToPwaInstallState(callback) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handler = (event) => {
        callback({ ...event.detail });
    };

    window.addEventListener(installStateEventName, handler);

    return () => {
        window.removeEventListener(installStateEventName, handler);
    };
}

export function registerAppServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return Promise.resolve(null);
    }

    if (!serviceWorkerRegistrationPromise) {
        serviceWorkerRegistrationPromise = navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    return serviceWorkerRegistrationPromise;
}

export function bootstrapPwaInstall() {
    if (typeof window === 'undefined' || bootstrapped) {
        return;
    }

    bootstrapped = true;
    setInstallState({
        installed: detectStandaloneMode(),
        supported: window.isSecureContext && 'serviceWorker' in navigator,
    });

    registerAppServiceWorker().catch(() => {
        setInstallState({ supported: false });
    });

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;

        setInstallState({
            available: true,
            availableAt: new Date().toISOString(),
            installed: false,
        });
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;

        setInstallState({
            available: false,
            availableAt: null,
            installed: true,
        });
    });

    const refreshInstalledState = () => {
        const installed = detectStandaloneMode();

        if (installed) {
            deferredInstallPrompt = null;
        }

        setInstallState({
            installed,
            available: installed ? false : installState.available,
            availableAt: installed ? null : installState.availableAt,
            supported: window.isSecureContext && 'serviceWorker' in navigator,
        });
    };

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refreshInstalledState();
        }
    });

    window.addEventListener('focus', refreshInstalledState);

    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');
    standaloneQuery?.addEventListener?.('change', refreshInstalledState);
}

export async function promptPwaInstall() {
    if (!deferredInstallPrompt) {
        return { outcome: 'unavailable' };
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;

    setInstallState({
        available: false,
        availableAt: null,
    });

    await promptEvent.prompt();

    const choiceResult = await promptEvent.userChoice.catch(() => null);

    return {
        outcome: choiceResult?.outcome || 'dismissed',
    };
}
