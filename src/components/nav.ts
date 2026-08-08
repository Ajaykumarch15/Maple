import {
  CollectionsIcon,
  HomeIcon,
  LibraryIcon,
  ReflectionsIcon,
  SearchIcon,
} from "./icons";

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/library", label: "Library", icon: LibraryIcon, end: false },
  { to: "/collections", label: "Collections", icon: CollectionsIcon, end: false },
  { to: "/reflections", label: "Reflections", icon: ReflectionsIcon, end: false },
  { to: "/search", label: "Search", icon: SearchIcon, end: false },
];
