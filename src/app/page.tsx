const books = [
  { title: 'The Snow Garden', author: 'Lena Morris', type: 'Literary fiction', price: '$18.00', cover: 'bg-primary text-primary-foreground' },
  { title: 'Small Hours', author: 'Mara Voss', type: 'Essays', price: '$16.50', cover: 'bg-accent text-foreground' },
  { title: 'The Long Way Home', author: 'Elliot Reed', type: 'Memoir', price: '$21.00', cover: 'bg-secondary text-foreground' },
  { title: 'Field Notes', author: 'Nina Okafor', type: 'Nature writing', price: '$19.00', cover: 'bg-foreground text-background' },
  { title: 'A Soft Place', author: 'June Calder', type: 'Poetry', price: '$14.00', cover: 'bg-primary text-primary-foreground' },
  { title: 'Orchard Light', author: 'Theo Bell', type: 'Short stories', price: '$17.00', cover: 'bg-secondary text-foreground' },
];

const categories = ['All books', 'Fiction', 'Nonfiction', 'Poetry', 'Children’s'];

function BookCover({ title, cover, featured = false }: { title: string; cover: string; featured?: boolean }) {
  return (
    <div className={`relative flex aspect-[3/4] overflow-hidden rounded-control ${cover} ${featured ? 'w-40 shrink-0 sm:w-52' : 'w-full'}`}>
      <div className="absolute inset-3 border border-current/35" />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="text-[12px] font-medium uppercase tracking-[0.16em]">The Reading Room</span>
        <span className="font-heading text-2xl leading-tight text-balance sm:text-3xl">{title}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-border py-6">
          <a href="#main-content" className="font-heading text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">The Reading Room</a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#collection" className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Browse</a>
            <a href="#about" className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">About us</a>
            <a href="#journal" className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Journal</a>
          </nav>
          <button type="button" aria-label="Open search" className="flex min-h-11 min-w-11 items-center justify-end text-sm font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            Search <span aria-hidden="true" className="ml-2 text-lg">⌕</span>
          </button>
        </header>

        <section className="animate-rise-in grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-20" aria-labelledby="hero-title">
          <div>
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-primary">Independent books for curious minds</p>
            <h1 id="hero-title" className="max-w-3xl font-heading text-5xl leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-[72px]">A good book can change the shape of a day.</h1>
          </div>
          <div className="max-w-sm pb-1 lg:justify-self-end">
            <p className="text-lg leading-7 text-muted-foreground">A small, carefully chosen collection of stories, ideas, and beautiful things to keep close.</p>
            <a href="#collection" className="mt-8 inline-flex min-h-11 items-center border-b border-foreground pb-1 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Explore the collection <span aria-hidden="true" className="ml-3">↘</span></a>
          </div>
        </section>

        <section className="animate-rise-in border-y border-border py-8 [animation-delay:80ms]" aria-label="Featured book">
          <div className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <BookCover title="The Shape of Rain" cover="bg-foreground text-background" featured />
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-primary">Book of the month</p>
              <h2 className="font-heading text-3xl leading-tight sm:text-4xl">The Shape of Rain</h2>
              <p className="mt-2 text-muted-foreground">A luminous novel about memory, weather, and the places we return to.</p>
              <p className="mt-4 text-sm font-medium">By Celia Hart · $22.00</p>
            </div>
            <button type="button" className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-[0.98]">Add to bag</button>
          </div>
        </section>

        <section id="collection" className="animate-rise-in py-16 [animation-delay:120ms] sm:py-20" aria-labelledby="collection-title">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="collection-title" className="font-heading text-4xl tracking-tight sm:text-5xl">The collection</h2>
              <p className="mt-3 text-muted-foreground">Somewhere to start, whatever you’re in the mood for.</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Book categories">
              {categories.map((category, index) => (
                <button key={category} type="button" className={`rounded-full px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${index === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{category}</button>
              ))}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-6">
            {books.map((book, index) => (
              <article key={book.title} className="group animate-rise-in [animation-delay:180ms]">
                <a href="#collection" className="block rounded-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  <BookCover title={book.title} cover={book.cover} />
                  <div className="pt-4">
                    <h3 className="truncate font-heading text-xl leading-tight transition-colors group-hover:text-primary">{book.title}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{book.author}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{book.type}</span>
                      <span className="font-semibold">{book.price}</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="grid gap-8 border-t border-border py-16 sm:grid-cols-[0.8fr_1fr] sm:py-20" aria-labelledby="about-title">
          <h2 id="about-title" className="font-heading text-3xl sm:text-4xl">Books with a little more room to breathe.</h2>
          <p className="max-w-xl text-lg leading-7 text-muted-foreground">We believe the right book arrives at the right time. Our shelves are edited slowly, with a soft spot for thoughtful writing, generous ideas, and covers you’ll want to leave face-up on the coffee table.</p>
        </section>

        <footer id="journal" className="flex flex-col gap-4 border-t border-border py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 The Reading Room</p>
          <p>Made for long afternoons and late chapters.</p>
        </footer>
      </div>
    </main>
  );
}
