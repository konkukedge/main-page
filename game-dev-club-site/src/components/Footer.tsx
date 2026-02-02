import { Instagram, Github, Coffee } from "lucide-react"; // Coffee 아이콘 추가
// import NaverCafeIcon from "./icons/NaverCafeIcon"; // NaverCafeIcon 임포트 제거

const socialLinks = [
  { name: "naver", href: "https://cafe.naver.com/imedge", icon: <Coffee /> }, // Coffee 아이콘으로 교체
  { name: "instagram", href: "https://www.instagram.com/edge_dongari?igsh=dzkzOTNzOHI5eDJj", icon: <Instagram /> },
  { name: "github", href: "https://github.com/konkukedge", icon: <Github /> },
];

const Footer = () => {
  return (
    <footer className="w-full max-w-4xl mx-auto mt-8 py-4">
      <div className="flex justify-center space-x-6">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="text-gray-400 hover:text-brand-green transition-colors"
          >
            {link.icon}
          </a>
        ))}
      </div>
      <p className="text-center text-gray-500 text-sm mt-4">
        © {new Date().getFullYear()} EDGE. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
