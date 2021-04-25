import { AudioListener, Audio, PositionalAudio, AudioLoader } from '../../libs/three128/three.module.js';

class SFX{
    constructor(camera, assetsPath){
        this.listener = new AudioListener();
        camera.add( this.listener );

        this.assetsPath = assetsPath;

        this.sounds = {};
    }

    load(name, vol=0.5, loop=true, obj=null){
        // create a global audio source
        const sound = (obj==null) ? new Audio( this.listener ) : new PositionalAudio( this.listener );

        this.sounds[name] = sound;

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader().setPath(this.assetsPath);
        audioLoader.load( `${name}.mp3`, buffer => {
            sound.setBuffer( buffer );
            sound.setLoop( loop );
            sound.setVolume( vol );
        });
    }

    setVolume(name, volume){
        const sound = this.sounds[name];

        if (sound !== undefined) sound.setVolume(volume);
    }

    setLoop(name, loop){
        const sound = this.sounds[name];

        if (sound !== undefined) sound.setLoop(loop);
    }

    play(name){
        const sound = this.sounds[name];

        if (sound !== undefined) sound.play();
    }

    stop(name){
        const sound = this.sounds[name];

        if (sound !== undefined) sound.play();
    }

    pause(name){
        const sound = this.sounds[name];

        if (sound !== undefined) sound.pause();
    }
}