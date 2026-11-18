import { BookCover } from '@/components/book-cover';
import { BookGrid } from '@/components/book-grid';

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <header className="border-border flex items-center justify-between border-b py-6">
          <a
            href="#main-content"
            className={[
              'font-heading focus-visible:outline-ring text-2xl font-semibold',
              'tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4',
            ].join(' ')}
          >
            The Reading Room
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-8 text-sm font-medium md:flex"
          >
            <a
              href="#collection"
              className={[
                'hover:text-primary focus-visible:outline-ring transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-4',
              ].join(' ')}
            >
              Browse
            </a>
            <a
              href="#about"
              className={[
                'hover:text-primary focus-visible:outline-ring transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-4',
              ].join(' ')}
            >
              About us
            </a>
            <a
              href="#journal"
              className={[
                'hover:text-primary focus-visible:outline-ring transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-4',
              ].join(' ')}
            >
              Journal
            </a>
          </nav>
          <button
            type="button"
            aria-label="Open search"
            className={[
              'hover:text-primary focus-visible:outline-ring flex min-h-11 min-w-11',
              'items-center justify-end text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-4',
            ].join(' ')}
          >
            Search{' '}
            <span aria-hidden="true" className="ml-2 text-lg">
              ⌕
            </span>
          </button>
        </header>

        <section
          className={[
            'animate-rise-in grid gap-10 py-16 sm:py-24',
            'lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-20',
          ].join(' ')}
          aria-labelledby="hero-title"
        >
          <div>
            <p className="text-primary mb-6 text-sm font-medium tracking-widest uppercase">
              Independent books for curious minds
            </p>
            <h1
              id="hero-title"
              className={[
                'font-heading max-w-3xl text-5xl leading-tight tracking-tight',
                'text-balance sm:text-6xl lg:text-6xl',
              ].join(' ')}
            >
              A good book can change the shape of a day.
            </h1>
          </div>
          <div className="max-w-sm pb-1 lg:justify-self-end">
            <p className="text-muted-foreground text-lg leading-7">
              A small, carefully chosen collection of stories, ideas, and beautiful things to keep
              close.
            </p>
            <a
              href="#collection"
              className={[
                'border-foreground hover:border-primary hover:text-primary',
                'focus-visible:outline-ring mt-8 inline-flex min-h-11 items-center',
                'border-b pb-1 text-sm font-semibold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-4',
              ].join(' ')}
            >
              Explore the collection{' '}
              <span aria-hidden="true" className="ml-3">
                ↘
              </span>
            </a>
          </div>
        </section>

        <section
          className="animate-rise-in border-border border-y py-8 [animation-delay:80ms]"
          aria-label="Featured book"
        >
          <div className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <BookCover title="The Shape of Rain" cover="bg-foreground text-background" featured />
            <div className="max-w-xl">
              <p className="text-primary mb-3 text-sm font-medium tracking-widest uppercase">
                Book of the month
              </p>
              <h2 className="font-heading text-3xl leading-tight sm:text-4xl">The Shape of Rain</h2>
              <p className="text-muted-foreground mt-2">
                A luminous novel about memory, weather, and the places we return to.
              </p>
              <p className="mt-4 text-sm font-medium">By Celia Hart · $22.00</p>
            </div>
            <button
              type="button"
              className={[
                'rounded-control bg-primary text-primary-foreground hover:bg-foreground',
                'focus-visible:outline-ring min-h-11 px-5 text-sm font-semibold transition',
                'focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-95',
              ].join(' ')}
            >
              Add to bag
            </button>
          </div>
        </section>

        <section
          id="collection"
          className="animate-rise-in py-16 [animation-delay:120ms] sm:py-20"
          aria-labelledby="collection-title"
        >
          <BookGrid />
        </section>

        <section
          id="about"
          className="border-border grid gap-8 border-t py-16 sm:grid-cols-[0.8fr_1fr] sm:py-20"
          aria-labelledby="about-title"
        >
          <h2 id="about-title" className="font-heading text-3xl sm:text-4xl">
            Books with a little more room to breathe.
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg leading-7">
            We believe the right book arrives at the right time. Our shelves are edited slowly, with
            a soft spot for thoughtful writing, generous ideas, and covers you’ll want to leave
            face-up on the coffee table.
          </p>
        </section>

        <footer
          id="journal"
          className={[
            'border-border text-muted-foreground flex flex-col gap-4 border-t py-8 text-sm',
            'sm:flex-row sm:items-center sm:justify-between',
          ].join(' ')}
        >
          <p>© 2025 The Reading Room</p>
          <p>Made for long afternoons and late chapters.</p>
        </footer>
      </div>
    </main>
  );
}
