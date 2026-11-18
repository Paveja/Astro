type BookCoverProps = {
  title: string;
  cover: string;
  featured?: boolean;
};

export function BookCover({ title, cover, featured = false }: BookCoverProps) {
  return (
    <div
      className={`rounded-control relative flex aspect-[3/4] overflow-hidden ${cover} ${featured ? 'w-40 shrink-0 sm:w-52' : 'w-full'}`}
    >
      <div className="absolute inset-3 border border-current/35" />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="text-xs font-medium tracking-widest uppercase">The Reading Room</span>
        <span className="font-heading text-2xl leading-tight text-balance sm:text-3xl">
          {title}
        </span>
      </div>
    </div>
  );
}
