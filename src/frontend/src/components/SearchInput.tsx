import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, placeholder, onChange }: SearchInputProps) {
  return (
    <label className="card flex flex-1 items-center gap-2 px-3 py-2 text-sm text-slate-500">
      <Search size={16} aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
