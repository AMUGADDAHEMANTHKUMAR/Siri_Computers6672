import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Upload, 
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const { logout } = useAdmin();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'import', label: 'Import Products', icon: Upload },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Inventory Management</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                currentView === item.id && "bg-primary/10 text-primary"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-auto p-2"
          onClick={logout}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};