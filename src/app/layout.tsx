import "@/styles/globals.css";

export const metadata = {
  title: "Image Gallery",
  description: "A bedrock gallery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-cover bg-center h-screen w-screen"
        style={{
          backgroundImage: "url('/images/background.png')", // 배경화면 이미지 설정
        }}
      >
        {children}
      </body>
    </html>
  );
}
