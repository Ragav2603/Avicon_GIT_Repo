import { Link } from "react-router-dom";
import aviconLogo from "@/assets/avicon-logo.webp";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}

const Logo = ({ size = "md", asLink = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-20",
    md: "h-[84px]",
    lg: "h-32",
  };

  const content = (
    <div className="flex items-center gap-2 group">
      <img 
        src={aviconLogo} 
        alt="AviCon Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
