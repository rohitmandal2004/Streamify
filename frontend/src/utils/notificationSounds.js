// Notification sound utility using High Quality CDN Assets
export const playJoinSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Sound play blocked"));
    } catch (e) {}
}

export const playLeaveSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Sound play blocked"));
    } catch (e) {}
}

export const playChatSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
        audio.volume = 0.25;
        audio.play().catch(e => console.log("Sound play blocked"));
    } catch (e) {}
}

export const playRaiseHandSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Sound play blocked"));
    } catch (e) {}
}
