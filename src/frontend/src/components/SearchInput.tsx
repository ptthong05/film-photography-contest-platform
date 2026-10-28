import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, placeholder, onChange }: SearchInputProps) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
