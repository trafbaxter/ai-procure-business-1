import { LogOut, Settings, UserCircle, Shield, Users } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('🔧 UserDropdown - user object:', user);
  console.log('🔧 UserDropdown - user.name:', user?.name);
  console.log('🔧 UserDropdown - user.email:', user?.email);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleSecurity = () => {
    navigate('/security');
  };

  const handleUserManagement = () => {
    navigate('/users');
  };

  // Use lowercase property names (user.name, user.email)
  const displayName = user.name || user.email || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="bg-white/10 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <UserCircle className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSecurity}>
          <Shield className="mr-2 h-4 w-4" />
          Security
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem onClick={handleUserManagement}>
            <Users className="mr-2 h-4 w-4" />
            User Management
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserDropdown;