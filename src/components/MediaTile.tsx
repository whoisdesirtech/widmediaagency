interface MediaTileProps {
  img: { url: string; name: string; kind?: 'image' | 'folder' | 'file' };
  className?: string;
  onClick?: () => void;
}

export default function MediaTile({ img, className, onClick }: MediaTileProps) {
  if (img.kind === 'folder') {
    return (
      <a
        href={img.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className || ''} w-full flex flex-col items-center justify-center gap-1 bg-miami-pink/5 text-center hover:bg-miami-pink/10 transition-colors`}
      >
        <span className="text-3xl">📁</span>
        <span className="text-[0.6rem] font-semibold text-miami-pink px-1">Open folder ↗</span>
      </a>
    );
  }
  if (img.kind === 'file') {
    return (
      <a
        href={img.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className || ''} w-full flex flex-col items-center justify-center gap-1 bg-muted-lighter/40 text-center hover:bg-muted-lighter/70 transition-colors`}
      >
        <span className="text-3xl">🗂️</span>
        <span className="text-[0.6rem] font-semibold text-miami-pink px-1">Download / view ↗</span>
      </a>
    );
  }
  return (
    <img
      src={img.url}
      alt={img.name}
      className={`${className || ''} w-full object-cover cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    />
  );
}
