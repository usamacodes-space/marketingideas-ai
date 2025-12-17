export const metadata = {
  title: "Marketing Ideas",
  description: "Personalized marketing ideas from the newsletter archive."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
