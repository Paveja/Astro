import { Fraunces, Work_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const workSans = Work_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const metadata = {
  title: 'The Reading Room | Independent Bookshop',
  description: 'A considered collection of books for curious readers.',
};

export { metadata };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
