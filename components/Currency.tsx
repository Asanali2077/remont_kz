interface CurrencyProps {
  value: number;
  className?: string;
}

export function Currency({ value, className }: CurrencyProps) {
  return (
    <span className={className}>
      {value.toLocaleString("ru-RU")} ₸
    </span>
  );
}
