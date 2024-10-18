import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from 'lucide-react';
import { setIsPlaying, setCurrentTrack, toggleShuffle, toggleRepeat, setVolume, setProgress } from '../features/spotifySlice';

export default function MusicControlPanel() {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const { currentTrack, isPlaying, shuffle, repeat, volume, progress, playlist } = useSelector((state) => state.spotify);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (currentTrack) {
      dispatch(setIsPlaying(!isPlaying));
    }
  };

  const handlePrevTrack = () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    dispatch(setCurrentTrack(playlist[prevIndex]));
  };

  const handleNextTrack = () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    dispatch(setCurrentTrack(playlist[nextIndex]));
  };

  const handleShuffleToggle = () => {
    dispatch(toggleShuffle());
  };

  const handleRepeatToggle = () => {
    dispatch(toggleRepeat());
  };

  const handleVolumeChange = (e) => {
    dispatch(setVolume(Number(e.target.value)));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      dispatch(setProgress(progress));
    }
  };

  const handleEnded = () => {
    if (repeat) {
      audioRef.current.play();
    } else {
      handleNextTrack();
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case ' ':
        handlePlayPause();
        break;
      case 'ArrowUp':
        dispatch(setVolume(Math.min(volume + 10, 100)));
        break;
      case 'ArrowDown':
        dispatch(setVolume(Math.max(volume - 10, 0)));
        break;
      case 'ArrowRight':
        handleNextTrack();
        break;
      case 'ArrowLeft':
        handlePrevTrack();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#282828] text-white p-4 shadow-lg">
      <audio
        ref={audioRef}
        src={currentTrack?.preview_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Album and Track Info */}
        <div className="flex items-center space-x-4">
          {currentTrack && currentTrack.album && currentTrack.album.images && currentTrack.album.images.length > 0 ? (
            <>
              <img src={currentTrack.album.images[0].url} alt={currentTrack.name} className="w-16 h-16 rounded-lg shadow-md" />
              <div>
                <p className="font-semibold text-lg">{currentTrack.name}</p>
                <p className="text-sm text-gray-400">{currentTrack.artists.map(a => a.name).join(', ')}</p>
              </div>
            </>
          ) : (
            <div className="text-gray-400">No track selected</div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-4">
            <button onClick={handleShuffleToggle} className={`hover:text-white ${shuffle ? 'text-[#1ed760]' : 'text-gray-400'}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={handlePrevTrack} className="text-gray-400 hover:text-white">
              <SkipBack size={20} />
            </button>
            <button onClick={handlePlayPause} className="bg-[#1ed760] text-black rounded-full p-2 hover:scale-105 transition-transform duration-200">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={handleNextTrack} className="text-gray-400 hover:text-white">
              <SkipForward size={20} />
            </button>
            <button onClick={handleRepeatToggle} className={`hover:text-white ${repeat ? 'text-[#1ed760]' : 'text-gray-400'}`}>
              <Repeat size={20} />
            </button>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1">
            <div className="bg-[#1ed760] h-1 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-[#1ed760] hover:cursor-pointer"
          />
        </div> 
      </div>
    </div>
  );
}
