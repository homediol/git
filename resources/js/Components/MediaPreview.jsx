const isVideoFile = (src) => {
    if (typeof src !== 'string') return false;
    return /\.(mp4|mov|avi|wmv|webm|m4v|mkv|flv|3gp|ogv|mpeg|mpg|ts|mts|m2ts)(\?|#|$)/i.test(src);
};

const isAudioFile = (src) => {
    if (typeof src !== 'string') return false;
    return /\.(mp3|wav|ogg|m4a)(\?|#|$)/i.test(src);
};

export default function MediaPreview({
    src,
    alt = '',
    className = '',
    isVideo,
    isAudio,
    videoProps = {},
    audioProps = {},
    imgProps = {},
}) {
    if (!src) return null;

    const shouldRenderAudio = typeof isAudio === 'boolean' ? isAudio : isAudioFile(src);
    if (shouldRenderAudio) {
        return (
            <audio
                src={src}
                aria-label={alt || undefined}
                className={className}
                {...audioProps}
            />
        );
    }

    const shouldRenderVideo = typeof isVideo === 'boolean' ? isVideo : isVideoFile(src);

    if (shouldRenderVideo) {
        return (
            <video
                src={src}
                aria-label={alt || undefined}
                className={className}
                {...videoProps}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            {...imgProps}
        />
    );
}

export { isVideoFile, isAudioFile };
