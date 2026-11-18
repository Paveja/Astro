import { BookCover } from './book-cover';

const books = [
  {
    title: 'The Snow Garden',
    author: 'Lena Morris',
    type: 'Literary fiction',
    price: '$18.00',
    cover: 'bg-primary text-primary-foreground',
  },
  {
    title: 'Small Hours',
    author: 'Mara Voss',
    type: 'Essays',
    price: '$16.50',
    cover: 'bg-accent text-foreground',
  },
  {
    title: 'The Long Way Home',
    author: 'Elliot Reed',
    type: 'Memoir',
    price: '$21.00',
    cover: 'bg-secondary text-foreground',
  },
  {
    title: 'Field Notes',
    author: 'Nina Okafor',
    type: 'Nature writing',
    price: '$19.00',
    cover: 'bg-foreground text-background',
  },
  {
    title: 'A Soft Place',
    author: 'June Calder',
    type: 'Poetry',
    price: '$14.00',
    cover: 'bg-primary text-primary-foreground',
  },
  {
    title: 'Orchard Light',
    author: 'Theo Bell',
    type: 'Short stories',
    price: '$17.00',
    cover: 'bg-secondary text-foreground',
  },
];

const categories = ['All books', 'Fiction', 'Nonfiction', 'Poetry', 'Children’s'];

export function BookGrid() {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="collection-title" className="font-heading text-4xl tracking-tight sm:text-5xl">
            The collection
          </h2>
          <p className="text-muted-foreground mt-3">
            Somewhere to start, whatever you’re in the mood for.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Book categories">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`focus-visible:outline-ring rounded-full px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 ${index === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-6">
        {books.map((book) => (
          <article key={book.title} className="group animate-rise-in [animation-delay:180ms]">
            <a
              href="#collection"
              className="rounded-container focus-visible:outline-ring block focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <BookCover title={book.title} cover={book.cover} />
              <div className="pt-4">
                <h3 className="font-heading group-hover:text-primary truncate text-xl leading-tight transition-colors">
                  {book.title}
                </h3>
                <p className="text-muted-foreground mt-1 truncate text-sm">{book.author}</p>
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{book.type}</span>
                  <span className="font-semibold">{book.price}</span>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
