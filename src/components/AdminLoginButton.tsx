import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';

interface AdminLoginButtonProps {
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

export const AdminLoginButton: React.FC<AdminLoginButtonProps> = ({
  className = '',
  onClick,
  fullWidth = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/admin/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`h-11 px-5 rounded-xl border border-[#D4A43C] text-[#D4A43C] hover:bg-[#D4A43C] hover:text-[#0D0D0D] transition-all duration-300 font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      title="Administrator Login"
    >
      <UserRound className="w-4 h-4 text-[#D4A43C] group-hover:text-[#0D0D0D] transition-colors" />
      <span>Admin Login</span>
    </button>
  );
};
