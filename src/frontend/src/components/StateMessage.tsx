interface StateMessageProps {
  message: string;
  isError?: boolean;
}

export function StateMessage({ message, isError = false }: StateMessageProps) {
  return (
    <p role={isError ? "alert" : "status"} className={`card p-6 text-sm ${isError ? "text-rose-600" : "text-slate-500"}`}>
      {message}
    </p>
  );
}
