import './globals.css'; // or your global CSS
import { Analytics } from '@vercel/analytics/react'; // use /react here

export const metadata = {
  title: 'Your Site Title',
  description: 'Your site description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}