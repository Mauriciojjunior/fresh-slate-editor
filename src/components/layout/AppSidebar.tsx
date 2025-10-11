import { Home, Book, Disc3, Wine, Gamepad2, Settings, BarChart3, Download, ChevronDown, Users, Library, GlassWater } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserRole } from "@/hooks/useUserRole";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Livros", url: "/livros", icon: Book },
  { title: "Discos", url: "/discos", icon: Disc3 },
  { title: "Bebidas", url: "/bebidas", icon: Wine },
  { title: "Jogos", url: "/jogos", icon: Gamepad2 },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Exportação", url: "/exportacao", icon: Download },
];

const adminItems = [
  { 
    title: "Visão Geral", 
    url: "/admin", 
    icon: Settings 
  },
  {
    title: "Livros",
    icon: Library,
    subItems: [
      { title: "Categorias de Livros", url: "/admin/livros" }
    ]
  },
  {
    title: "Bebidas",
    icon: GlassWater,
    subItems: [
      { title: "Tipos de Bebida e Uva", url: "/admin/bebidas" }
    ]
  },
  { 
    title: "Usuários", 
    url: "/admin/usuarios", 
    icon: Users 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { role } = useUserRole();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">Inventário</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center mx-auto">
              <Home className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Coleções</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  if ('subItems' in item && item.subItems) {
                    const hasActiveSubItem = item.subItems.some(subItem => isActive(subItem.url));
                    return (
                      <Collapsible
                        key={item.title}
                        open={openMenus[item.title] || hasActiveSubItem}
                        onOpenChange={() => toggleMenu(item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={hasActiveSubItem ? "bg-sidebar-accent/50" : ""}
                              title={collapsed ? item.title : undefined}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.title}</span>
                              <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${openMenus[item.title] || hasActiveSubItem ? 'rotate-180' : ''}`} />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={subItem.url}
                                      className={getNavClassName(subItem.url)}
                                    >
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url!} 
                          className={getNavClassName(item.url!)}
                          title={collapsed ? item.title : undefined}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}